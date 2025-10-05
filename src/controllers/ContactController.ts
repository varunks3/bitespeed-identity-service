import { Request, Response } from 'express';
import { ContactService } from '../services/ContactService';
import { IdentifyRequest } from '../types';
import Joi from 'joi';

const contactService = new ContactService();

// Validation schema for identify request
const identifyRequestSchema = Joi.object({
  email: Joi.string().email().optional().allow(null, ''),
  phoneNumber: Joi.string().optional().allow(null, ''),
}).custom((value, helpers) => {
  // At least one of email or phoneNumber must be provided and not empty
  if ((!value.email || value.email.trim() === '') && (!value.phoneNumber || value.phoneNumber.trim() === '')) {
    return helpers.error('custom.atLeastOneRequired');
  }
  return value;
}).messages({
  'custom.atLeastOneRequired': 'Either email or phoneNumber must be provided and not empty',
});

export class ContactController {
  /**
   * POST /identify
   * Identify and consolidate customer contact information
   */
  async identify(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = identifyRequestSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.details.map(detail => detail.message),
        });
        return;
      }

      const request: IdentifyRequest = {
        email: value.email?.trim() || undefined,
        phoneNumber: value.phoneNumber?.trim() || undefined,
      };

      // Process the identify request
      const result = await contactService.identify(request);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in identify endpoint:', error);
      
      if (error instanceof Error) {
        res.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        });
      }
    }
  }

  /**
   * GET /health
   * Health check endpoint
   */
  async health(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Bitespeed Identity Service',
    });
  }
}
