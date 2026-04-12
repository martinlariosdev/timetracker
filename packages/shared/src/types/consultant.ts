/**
 * Consultant represents a user of the TimeTrack system
 */
export interface Consultant {
  /** Unique identifier for the consultant */
  id: number;

  /** Full name of the consultant */
  name: string;

  /** Email address */
  email: string;

  /** ID of the consultant's team lead */
  teamLeadId: number;

  /** Name of the team lead */
  teamLeadName: string;

  /** Email address of the team lead */
  teamLeadEmail: string;

  /** Current ETO (Earned Time Off) balance in hours */
  etoBalance: number;

  /** Expected working hours per pay period */
  workingHoursPerPeriod: number;

  /** Payment type for the consultant */
  paymentType: 'Hourly' | 'Monthly';
}

/**
 * TeamLead represents a team lead who manages consultants
 */
export interface TeamLead {
  /** Unique identifier for the team lead */
  id: number;

  /** Full name of the team lead */
  name: string;

  /** Email address */
  email: string;
}
