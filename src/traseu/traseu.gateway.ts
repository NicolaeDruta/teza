import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TraseuService } from './traseu.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OpenRouteService } from '../common/openroute/openroute.service';
import * as geolib from 'geolib';

@WebSocketGateway({ cors: true })
export class TraseuGateway {
  @WebSocketServer()
  server: Server;

  private driverSockets = new Map<number, string>(); // Store driver socket IDs
  private passengerSockets = new Map<number, string>(); // Store passenger socket IDs
  private ongoingRides = new Map<number, number>();

  constructor(
    private readonly traseuService: TraseuService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly openRouteService: OpenRouteService
  ) {}

  /**
   * ✅ Driver registers their socket when they connect.
   */
  @SubscribeMessage('registerDriver')
  async handleRegisterDriver(
    @MessageBody() data: { token: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const decoded = this.jwtService.verify(data.token);
      const driver = await this.prisma.utilizator.findUnique({
        where: { id: decoded.userId },
      });

      if (!driver) {
        console.warn(`❌ Invalid driver token`);
        client.emit('registerDriver', { success: false, message: 'Invalid driver token' });
        return;
      }

      this.driverSockets.set(driver.id, client.id); // Store driver socket ID
      console.log(`✅ Driver registered: ID=${driver.id}, Socket=${client.id}`);

      client.emit('registerDriver', { success: true, message: 'Driver registered' });
    } catch (error) {
      client.emit('registerDriver', { success: false, message: 'Invalid token' });
    }
  }

  @SubscribeMessage('registerPassenger')
  async handleRegisterPassenger(
    @MessageBody() data: { token: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const decoded = this.jwtService.verify(data.token);
      const passenger = await this.prisma.utilizator.findUnique({ where: { id: decoded.userId } });

      if (!passenger) {
        client.emit('registerPassenger', { success: false, message: 'Invalid passenger token' });
        return;
      }

      this.passengerSockets.set(passenger.id, client.id); // Store passenger socket ID
      console.log(`✅ Passenger registered: ID=${passenger.id}, Socket=${client.id}`);

      client.emit('registerPassenger', { success: true, message: 'Passenger registered' });
    } catch (error) {
      client.emit('registerPassenger', { success: false, message: 'Invalid token' });
    }
  }

  /**
   * ✅ Passenger searches for a ride.
   */
  @SubscribeMessage('searchNow')
  async handleSearchNow(
    @MessageBody()
      data: {
      start: { lat: number; long: number };
      stop: { lat: number; long: number };
      token: string;
      localtime: string;
    },
    @ConnectedSocket() client: Socket
  ) {
    console.log(`🔍 Passenger searches for a route: start=${JSON.stringify(data.start)}, stop=${JSON.stringify(data.stop)}`);

    // ✅ Validate Token & Get User
    let user;
    try {
      const decoded = this.jwtService.verify(data.token);
      user = await this.prisma.utilizator.findUnique({ where: { id: decoded.userId } });

      if (!user) {
        client.emit('searchNow', { success: false, message: 'Invalid token.' });
        return;
      }

      console.log(`👤 User Found: ID=${user.id}, Name=${user.nume}, Evaluare=${user.evaluare}`);
    } catch (error) {
      client.emit('searchNow', { success: false, message: 'Invalid or expired token.' });
      return;
    }

    const userLocalTime = new Date(data.localtime);
    const userUTC = new Date(userLocalTime.getTime() - userLocalTime.getTimezoneOffset() * 60000);
    const maxStartTimeUTC = new Date(userUTC.getTime() + 10 * 60 * 1000); // +10 min

    console.log(`🌍 [User UTC Time]: ${userUTC.toISOString()}`);
    console.log(`🕒 [Max Start Time UTC]: ${maxStartTimeUTC.toISOString()}`);

    // ✅ Get All Routes Without Evaluare Filtering
    const potentialTrasee = await this.prisma.traseu.findMany({
      where: {
        oraStart: { gte: userUTC.toISOString(), lte: maxStartTimeUTC.toISOString() },
        vehicul: { isNot: null },
      },
      include: { coordonate: true, rezervari: true, vehicul: { include: { sofer: true } } },
    });

    console.log(`🚀 Found ${potentialTrasee.length} driver routes in DB.`);

    // ✅ JavaScript Filtering for Driver's Evaluare Range
    const minEvaluare = user.evaluare - 0.5;
    const maxEvaluare = user.evaluare + 0.5;
    console.log(`🎯 Filtering drivers with evaluare between ${minEvaluare} and ${maxEvaluare}`);

    const filteredTrasee = potentialTrasee.filter(traseu => {
      if (!traseu.vehicul || !traseu.vehicul.sofer) return false;
      const soferEvaluare = traseu.vehicul.sofer.evaluare;
      return soferEvaluare >= minEvaluare && soferEvaluare <= maxEvaluare;
    });

    console.log(`🚦 Routes after driver evaluation filtering: ${filteredTrasee.length}`);

    // ✅ Find First Matching Route
    const firstMatchingRoute = filteredTrasee.find((traseu) => {
      console.log(`🔎 Checking Traseu ID: ${traseu.id}`);

      const routeCoordinates = traseu.coordonate;
      if (routeCoordinates.length < 2) return false;

      const routeStart = { latitude: routeCoordinates[0].lat, longitude: routeCoordinates[0].long };
      const routeStop = { latitude: routeCoordinates[routeCoordinates.length - 1].lat, longitude: routeCoordinates[routeCoordinates.length - 1].long };

      const isStartNearby = geolib.isPointWithinRadius({ latitude: data.start.lat, longitude: data.start.long }, routeStart, 1000);
      const isStopNearby = geolib.isPointWithinRadius({ latitude: data.stop.lat, longitude: data.stop.long }, routeStop, 1000);

      if (!isStartNearby || !isStopNearby) return false;

      const ocupiedSeats = traseu.rezervari.length;
      const availableSeats = traseu.vehicul?.capacitate ?? 0 - ocupiedSeats - 1;

      return availableSeats > 0;
    });

    if (!firstMatchingRoute) {
      client.emit('searchNow', { success: false, message: 'Nu s-au găsit trasee disponibile.' });
      return;
    }

    console.log(`✅ MATCH FOUND: Traseu ID: ${firstMatchingRoute.id}`);

    // 🔵 Get Optimized Route from OpenRouteService
    const originalRouteCoords = firstMatchingRoute.coordonate.map(coord => ({ lat: coord.lat, long: coord.long }));
    const passengerRoute = [data.start, ...originalRouteCoords, data.stop];

    let optimizedRoute;
    try {
      optimizedRoute = await this.openRouteService.getRouteDuration(passengerRoute);
    } catch (error) {
      client.emit('searchNow', { success: false, message: 'Failed to optimize route.' });
      return;
    }

    console.log(`🚗 Optimized Route: ${JSON.stringify(optimizedRoute)}`);

    // 🔵 SEND OFFER TO DRIVER
    const driverId = firstMatchingRoute.vehicul?.sofer.id;
    if (!driverId) {
      client.emit('searchNow', { success: false, message: 'Driver ID not found.' });
      return;
    }

    const driverSocketId = this.driverSockets.get(driverId);
    if (!driverSocketId) {
      client.emit('searchNow', { success: false, message: 'Driver not available.' });
      return;
    }

    if (!driverSocketId) {
      client.emit('searchNow', { success: false, message: 'Driver not available.' });
      return;
    }

    console.log(`🚗 Sending offer to driver ID: ${driverId}, Socket: ${driverSocketId}`);
    this.server.to(driverSocketId).emit('askOffer', {
      id: firstMatchingRoute.id,
      passenger: { id: user.id, name: user.nume, price: optimizedRoute * 1.5 },
      optimisedRoute: passengerRoute,
    });

    // 🟢 LISTEN FOR DRIVER'S RESPONSE
    this.server.on('acceptedOffer', async (response) => {
      if (response.success && response.driverId === driverId) {
        client.emit('searchNow', { success: true, route: firstMatchingRoute });
      } else {
        client.emit('searchNow', { success: false, message: 'Driver declined the request.' });
      }
    });
  }

  /**
   * ✅ Driver accepts the ride - Save reservation & update the route.
   */
  @SubscribeMessage('acceptOffer')
  async handleAcceptedOffer(
    @MessageBody() data: { driverId: number; passengerId: number; accepted: boolean, routeId: number, start: { lat: number; long: number }, stop: { lat: number; long: number } },
    @ConnectedSocket() client: Socket
  ) {
    console.log(`🚗 Driver ${data.driverId} responded to the offer.`);

    if (!this.driverSockets.has(data.driverId)) {
      client.emit('acceptedOffer', { success: false, message: 'Driver not registered.' });
      return;
    }

    const passengerSocketId = this.passengerSockets.get(data.passengerId);

    if (!passengerSocketId) {
      client.emit('acceptedOffer', { success: false, message: 'Passenger not available.' });
      return;
    }

    if (!data.accepted) {
      console.log(`❌ Driver ${data.driverId} declined the offer.`);
      this.server.to(passengerSocketId).emit('acceptedOffer', {
        success: false,
        message: 'Driver declined the ride.',
      });
      return;
    }

    console.log(`✅ Driver ${data.driverId} accepted the ride. Creating reservation...`);

    try {
      // ✅ 1. Create a new reservation
      const newReservation = await this.prisma.rezervare.create({
        data: {
          utilizatorId: data.passengerId,
          traseuId: data.routeId,
          statut: "Acceptat"
        },
      });

      console.log(`🎟 Reservation Created: ID=${newReservation.id}`);

      // ✅ 2. Update the route with the passenger's start & stop
      await this.prisma.coordonate.createMany({
        data: [
          { traseuId: data.routeId, lat: data.start.lat, long: data.start.long },
          { traseuId: data.routeId, lat: data.stop.lat, long: data.stop.long },
        ],
      });

      console.log(`📍 Route updated with new passenger's start/stop locations.`);

      // ✅ 3. Notify the passenger that the ride is confirmed
      this.server.to(passengerSocketId).emit('acceptOffer', {
        success: true,
        message: 'Ride confirmed!',
        reservation: newReservation,
      });

      this.ongoingRides.set(data.driverId, data.passengerId);

      console.log(`✅ Passenger ${data.passengerId} notified about the confirmed ride.`);

    } catch (error) {
      console.error(`❌ Error creating reservation or updating route: ${error.message}`);
      client.emit('acceptedOffer', { success: false, message: 'Failed to process reservation.' });
    }
  }

  @SubscribeMessage('updateDriverLocation')
  async handleUpdateDriverLocation(
    @MessageBody() data: { driverId: number; location: { lat: number; long: number } },
    @ConnectedSocket() client: Socket
  ) {
    console.log(`📍 Received location update from driver ${data.driverId}:`, data.location);

    // Retrieve the ongoing ride mapping (driverId -> passengerId)
    const passengerId = this.ongoingRides.get(data.driverId);
    if (!passengerId) {
      console.warn(`❌ No ongoing ride found for driver ${data.driverId}`);
      return;
    }

    const passengerSocketId = this.passengerSockets.get(passengerId);
    if (!passengerSocketId) {
      console.warn(`❌ Passenger ${passengerId} is not connected.`);
      return;
    }

    // Forward the driver's location update to the passenger
    this.server.to(passengerSocketId).emit('driverLocationUpdate', {
      driverId: data.driverId,
      location: data.location,
    });
  }

  @SubscribeMessage('terminateOffer')
  async handleTerminateOffer(
    @MessageBody() data: { driverId: number },
    @ConnectedSocket() client: Socket
  ) {
    console.log(`🚗 Driver ${data.driverId} is terminating the ride.`);

    // Get the passenger associated with this ride
    const passengerId = this.ongoingRides.get(data.driverId);
    if (!passengerId) {
      console.warn(`❌ No active ride found for driver ${data.driverId}`);
      client.emit('terminateOffer', { success: false, message: 'No active ride found.' });
      return;
    }

    try {
      // ✅ Update the reservation status to "Terminata"
      await this.prisma.rezervare.updateMany({
        where: {
          utilizatorId: passengerId,
          traseu: {
            vehicul: { soferId: data.driverId },
          },
          statut: "Acceptat",
        },
        data: {
          statut: "Terminata",
        },
      });

      console.log(`✅ Ride terminated. Reservation updated to "Terminata".`);

      // ✅ Notify the passenger that the ride is over
      const passengerSocketId = this.passengerSockets.get(passengerId);
      if (passengerSocketId) {
        this.server.to(passengerSocketId).emit('terminateOffer', {
          success: true,
          message: 'Your ride has been completed.',
        });
      } else {
        console.warn(`❌ Passenger ${passengerId} is not connected.`);
      }

      // ✅ Remove the ride from the ongoing rides list
      this.ongoingRides.delete(data.driverId);

    } catch (error) {
      console.error(`❌ Error terminating ride: ${error.message}`);
      client.emit('terminateOffer', { success: false, message: 'Failed to terminate ride.' });
    }
  }
}
