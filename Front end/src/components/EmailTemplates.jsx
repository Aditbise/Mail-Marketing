import React, { useState, useEffect } from "react";
import axios from "axios";
import '../index.css';

export default function EmailTemplates() {
  const [companyInfo, setCompanyInfo] = useState(null);
  useEffect(() => {
    axios.get('http://localhost:3001/company-info')
      .then(response => {
        setCompanyInfo(response.data);
      })
      .catch(error => {
        console.error('Error fetching company info:', error);
      });
  }, []);
  
  return (
    <div className="email-body-editor-main-container">
      <div className="email-body-editor-display">
        Templates:-
      </div>
      <div className="email-body-editor-container">
        <div className="email-body-editor-header">
          {companyInfo?.logo && (
            <img 
            src={`http://localhost:3001${companyInfo.logo}`} 
            className="email-body-editor-logo" 
            alt="Company Logo" 
            />
          )}
          <a href={companyInfo?.website || '#'} className="email-body-editor-website">
            view in Browser
          </a>
        </div>

        <div className="email-body-editor-hero-content">
        </div>

        <div className="email-body-editor-content">
          <div className="email-body-editor-content-first-div">
            <p className="email-body-editor-content-first-line">Hello "customer name here"</p>
          </div>
          <input 
            type="text" 
            placeholder="content goes here..." 
            className="email-body-editor-content-input"
            />
        </div>

        <div className="email-body-editor-signature">
          <input type="text" placeholder="Signature goes here..." className="email-body-editor-signature-input"/>
        </div>

        <div className="email-body-editor-footer">
          <div className="email-body-editor-footer-text">
            <p>Stay in touch</p>
          </div>
          <div className="email-body-editor-social-container">
            <div className="email-body-editor-social-container-item">
              <a href={companyInfo?.facebook || '#'} className="email-body-editor-social-link" >📘 Facebook</a>
            </div>
            <div className="email-body-editor-social-container-item">
              <a href={companyInfo?.twitter || '#'} className="email-body-editor-social-link" >🐦 Twitter</a>
            </div>
            <div className="email-body-editor-social-container-item">
              <a href={companyInfo?.linkedin || '#'} className="email-body-editor-social-link" >💼 LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="email-body-editor-copyright">
          <p className="email-body-editor-copyright-email">
            Email sent by {companyInfo?.email || '#'}
          </p>
          <p>Copyright © {new Date().getFullYear()} {companyInfo?.companyName || 'Your Company'}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}