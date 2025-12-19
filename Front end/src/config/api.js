/**
 * API Configuration
 * Centralized API endpoint configuration for the Mail Marketing Frontend
 * Backend runs on: http://localhost:3001
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API Endpoints
export const API_ENDPOINTS = {
  // Company Info
  COMPANY_INFO: `${API_BASE_URL}/company-info`,
  COMPANY_INFO_BY_ID: (id) => `${API_BASE_URL}/company-info/${id}`,
  
  // Email Templates
  EMAIL_TEMPLATES: `${API_BASE_URL}/email-templates`,
  EMAIL_TEMPLATE_BY_ID: (id) => `${API_BASE_URL}/email-templates/${id}`,
  DELETE_EMAIL_TEMPLATE: (id) => `${API_BASE_URL}/email-templates/${id}`,
  
  // Email Bodies
  EMAIL_BODIES: `${API_BASE_URL}/email-bodies`,
  EMAIL_BODY_BY_ID: (id) => `${API_BASE_URL}/email-bodies/${id}`,
  DELETE_EMAIL_BODY: (id) => `${API_BASE_URL}/email-bodies/${id}`,
  
  // Segments
  SEGMENTS: `${API_BASE_URL}/segments`,
  SEGMENT_BY_ID: (id) => `${API_BASE_URL}/segments/${id}`,
  DELETE_SEGMENTS: `${API_BASE_URL}/segments/delete-many`,
  UPDATE_SEGMENT: (id) => `${API_BASE_URL}/segments/${id}`,
  
  // Email Campaigns
  EMAIL_CAMPAIGNS: `${API_BASE_URL}/email-campaigns`,
  EMAIL_CAMPAIGN_BY_ID: (id) => `${API_BASE_URL}/email-campaigns/${id}`,
  DELETE_EMAIL_CAMPAIGN: (id) => `${API_BASE_URL}/email-campaigns/${id}`,
  
  // Email Contacts
  EMAIL_CONTACTS: `${API_BASE_URL}/email-contacts`,
  EMAIL_CONTACT_BY_ID: (id) => `${API_BASE_URL}/email-contacts/${id}`,
  
  // Email Tracking
  EMAIL_TRACKING: `${API_BASE_URL}/email-tracking`,
};

export default API_ENDPOINTS;
