import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, X, Save } from 'lucide-react';

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

  if (loading) return (
    <div className="ml-0 h-screen w-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-zinc-400 text-lg">Loading company information...</p>
      </div>
    </div>
  );

  return (
    <div className="ml-0 h-screen w-screen bg-zinc-950 overflow-x-auto">
      <div className="ml-64 h-screen overflow-y-auto flex flex-col gap-6 px-6 py-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white m-0 mb-1">Company Information</h1>
          <p className="text-zinc-400 text-sm m-0">Manage your company profile and branding</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
          {/* Logo Section */}
          <section className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-lime-400 m-0 mb-4 flex items-center gap-2"><Upload className="w-6 h-6" /> Company Logo</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <label className="block bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-lg p-4 text-center cursor-pointer hover:border-lime-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 mx-auto mb-2 text-lime-400" />
                  <p className="text-zinc-300 font-semibold">Click to upload logo</p>
                  <p className="text-zinc-500 text-xs mt-1">PNG, JPG up to 5MB</p>
                </label>
              </div>
              {logoPreview && (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Company Logo Preview"
                    className="w-32 h-32 object-contain border-2 border-lime-500 rounded-lg p-2 bg-zinc-800"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                    title="Remove logo"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Basic Info */}
          <section className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-lime-400 m-0 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="companyName"
                placeholder="Company Name *"
                value={company.companyName || ''}
                onChange={handleChange}
                required
                className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
              />
              <input
                type="email"
                name="email"
                placeholder="Company Email *"
                value={company.email || ''}
                onChange={handleChange}
                required
                className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={company.phone || ''}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
              />
              <input
                type="url"
                name="website"
                placeholder="Website URL"
                value={company.website || ''}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
              />
            </div>
          </section>

          {/* Address */}
          <section className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-lime-400 m-0 mb-4">Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="address.street"
                placeholder="Street Address"
                value={company.address?.street || ''}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
              />
              <input
                type="text"
                name="address.city"
                placeholder="City"
                value={company.address?.city || ''}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
              />
              <input
                type="text"
                name="address.state"
                placeholder="State"
                value={company.address?.state || ''}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
              />
              <input
                type="text"
                name="address.zipCode"
                placeholder="ZIP Code"
                value={company.address?.zipCode || ''}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
              />
              <input
                type="text"
                name="address.country"
                placeholder="Country"
                value={company.address?.country || ''}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm md:col-span-2"
              />
            </div>
          </section>

          {/* Social Links */}
          <section className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-lime-400 m-0 mb-4">Social Media Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="url"
                name="socialLinks.facebook"
                placeholder="Facebook URL"
                value={company.socialLinks?.facebook || ''}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
              />
              <input
                type="url"
                name="socialLinks.twitter"
                placeholder="Twitter URL"
                value={company.socialLinks?.twitter || ''}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
              />
              <input
                type="url"
                name="socialLinks.linkedin"
                placeholder="LinkedIn URL"
                value={company.socialLinks?.linkedin || ''}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
              />
              <input
                type="url"
                name="socialLinks.instagram"
                placeholder="Instagram URL"
                value={company.socialLinks?.instagram || ''}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
              />
              <input
                type="url"
                name="socialLinks.youtube"
                placeholder="YouTube URL"
                value={company.socialLinks?.youtube || ''}
                onChange={handleChange}
                className="bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm md:col-span-2"
              />
            </div>
          </section>

          {/* Description */}
          <section className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-lime-400 m-0 mb-4">Additional Information</h2>
            <textarea
              name="description"
              placeholder="Company Description"
              value={company.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm resize-vertical mb-4"
            />
            <input
              type="text"
              name="industry"
              placeholder="Industry"
              value={company.industry || ''}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-lime-400 transition-colors text-sm"
            />
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-lime-500 hover:bg-lime-600 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-base"
          >
            <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Company Information'}
          </button>
        </form>
      </div>
    </div>
  );
}