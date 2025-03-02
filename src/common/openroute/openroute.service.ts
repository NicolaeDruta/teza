import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenRouteService {
  private readonly apiKey = process.env.ORS_API_KEY;
  private readonly baseUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';

  async getRouteDuration(coordinates: { lat: number; long: number }[]): Promise<number> {
    if (coordinates.length < 2) {
      throw new InternalServerErrorException('Traseul trebuie să aibă cel puțin două puncte');
    }

    const coordsArray = coordinates.map(coord => [coord.long, coord.lat]);

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          coordinates: coordsArray,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const duration = response.data.routes[0].summary.duration;
      return Math.round(duration / 60);
    } catch (error) {
      console.error('Eroare API ORS:', error.response?.data || error.message);
      throw new InternalServerErrorException('Eroare la calculul duratei traseului');
    }
  }
}
