import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CompanyInfo() {
  const [company, setCompany] = useState({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
    socialLinks: { facebook: '', twitter: '', linkedin: '', instagram: '', youtube: '' },
    logo: '',
    description: '',
    industry: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const response = await axios.get('http://localhost:3001/company-info');
      
      const companyData = {
        ...response.data,
        address: { street: '', city: '', state: '', zipCode: '', country: '', ...response.data.address },
        socialLinks: { facebook: '', twitter: '', linkedin: '', instagram: '', youtube: '', ...response.data.socialLinks }
      };
      
      setCompany(companyData);
      
      // Set logo preview if exists
      if (companyData.logo) {
        // If storing as file path (current setup)
        setLogoPreview(`http://localhost:3001${companyData.logo}`);
        // If storing in database, use:
        // setLogoPreview(`http://localhost:3001/company-info/logo`);
      }
    } catch (error) {
      console.error('Error fetching company info:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return null;

    try {
      // Compress image before upload
      const compressedFile = await compressImage(logoFile);
      
      const formData = new FormData();
      formData.append('logo', compressedFile);

      const response = await axios.post('http://localhost:3001/company-info/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data.logoPath || response.data.message;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // Resize to max 400x400
          const maxSize = 400;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          }, 'image/jpeg', 0.8);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let updatedCompany = { ...company };
      
      // Upload logo first if a new one is selected
      if (logoFile) {
        const logoResult = await uploadLogo();
        // Keep the logo path, don't set to boolean
        if (logoResult) {
          updatedCompany.logo = logoResult;
        }
      }

      await axios.put('http://localhost:3001/company-info', updatedCompany);
      setCompany(updatedCompany);
      alert('Company information updated successfully!');
      
      // Clear logo file state
      setLogoFile(null);
    } catch (error) {
      console.error('Error updating company info:', error);
      alert('Failed to update company information');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCompany(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setCompany(prev => ({ ...prev, [name]: value }));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setCompany(prev => ({ ...prev, logo: '' })); // Set to empty string, not false
  };

  if (loading) return <div>Loading company information...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h1>Company Information</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Logo Section */}
        <section>
          <h2>Company Logo</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ marginBottom: '10px' }}
              />
              {logoPreview && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={logoPreview}
                    alt="Company Logo Preview"
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'contain',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      padding: '10px',
                      backgroundColor: '#f9f9f9'
                    }}
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-10px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20%',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >X
                  </button>
                </div>
              )}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <p>Upload your company logo</p>
              <p>Recommended size: 200x200px</p>
              <p>Formats: JPG, PNG (Max 5MB)</p>
            </div>
          </div>
        </section>

        {/* Basic Info */}
        <section>
          <h2>Basic Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={company.companyName || ''}
              onChange={handleChange}
              required
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              type="email"
              name="email"
              placeholder="Company Email"
              value={company.email || ''}
              onChange={handleChange}
              required
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={company.phone || ''}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              type="url"
              name="website"
              placeholder="Website URL"
              value={company.website || ''}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
        </section>

        {/* Address */}
        <section>
          <h2>Address</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <input
              type="text"
              name="address.street"
              placeholder="Street Address"
              value={company.address?.street || ''}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              type="text"
              name="address.city"
              placeholder="City"
              value={company.address?.city || ''}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              type="text"
              name="address.state"
              placeholder="State"
              value={company.address?.state || ''}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              type="text"
              name="address.zipCode"
              placeholder="ZIP Code"
              value={company.address?.zipCode || ''}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
        </section>

        {/* Social Links */}
        <section>
          <h2>Social Media Links</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <input
              type="url"
              name="socialLinks.facebook"
              placeholder="Facebook URL"
              value={company.socialLinks?.facebook || ''}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              type="url"
              name="socialLinks.twitter"
              placeholder="Twitter URL"
              value={company.socialLinks?.twitter || ''}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              type="url"
              name="socialLinks.linkedin"
              placeholder="LinkedIn URL"
              value={company.socialLinks?.linkedin || ''}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              type="url"
              name="socialLinks.instagram"
              placeholder="Instagram URL"
              value={company.socialLinks?.instagram || ''}
              onChange={handleChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
        </section>

        {/* Description */}
        <section>
          <h2>Additional Information</h2>
          <textarea
            name="description"
            placeholder="Company Description"
            value={company.description || ''}
            onChange={handleChange}
            rows={4}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
          />
          <input
            type="text"
            name="industry"
            placeholder="Industry"
            value={company.industry || ''}
            onChange={handleChange}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', marginTop: '16px' }}
          />
        </section>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px 24px',
            background: saving ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {saving ? 'Saving...' : 'Save Company Information'}
        </button>
      </form>
    </div>
  );
}