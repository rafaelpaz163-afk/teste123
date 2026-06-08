import { Request, Response } from 'express';
import { leadService } from '../services/leadService';

export class LeadController {
  async list(req: Request, res: Response) {
    const { classification } = req.query;
    const leads = await leadService.getLeadsByClassification(classification as string);
    res.json(leads);
  }

  async export(req: Request, res: Response) {
    const { classification } = req.query;
    const leads = await leadService.exportLeads(classification as string);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');

    const headers = Object.keys(leads[0] || {}).join(',');
    const rows = leads.map(l => Object.values(l).join(','));
    res.send([headers, ...rows].join('\n'));
  }

  async recover(req: Request, res: Response) {
    const { id } = req.params;
    const lead = await leadService.recoverLead(id);
    res.json(lead);
  }
}

export const leadController = new LeadController();
