# Email Template API - Quick Reference

## Base URL
```
http://localhost:3001
```

## Endpoints

### POST /email-templates
**Create a new email template**

Request:
```javascript
{
  "name": "string (required)",
  "subject": "string (required)",
  "fromName": "string (required)",
  "content": "string (required)",
  "signature": "string (optional)",
  "layout": "modern|minimal|classic (default: modern)",
  "preview": "string (optional)",
  "heroImage": "base64 string or null (optional)",
  "description": "string (optional)",
  "isDefault": "boolean (default: false)"
}
```

Response (201 Created):
```javascript
{
  "message": "Template created successfully",
  "template": {
    "_id": "ObjectId",
    "name": "string",
    "subject": "string",
    "fromName": "string",
    "content": "string",
    "signature": "string",
    "layout": "string",
    "preview": "string",
    "heroImage": "string or null",
    "description": "string",
    "isDefault": "boolean",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

### GET /email-templates
**Get all email templates**

Request:
```javascript
// No body required
```

Response (200 OK):
```javascript
[
  {
    "_id": "ObjectId",
    "name": "string",
    "subject": "string",
    "fromName": "string",
    "content": "string",
    "signature": "string",
    "layout": "string",
    "preview": "string",
    "heroImage": "string or null",
    "description": "string",
    "isDefault": "boolean",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  },
  ...
]
```

---

### GET /email-templates/:id
**Get a single email template**

Request:
```javascript
// GET /email-templates/507f1f77bcf86cd799439011
```

Response (200 OK):
```javascript
{
  "_id": "ObjectId",
  "name": "string",
  "subject": "string",
  "fromName": "string",
  "content": "string",
  "signature": "string",
  "layout": "string",
  "preview": "string",
  "heroImage": "string or null",
  "description": "string",
  "isDefault": "boolean",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

---

### PUT /email-templates/:id
**Update an email template**

Request:
```javascript
{
  "name": "string (required)",
  "subject": "string (required)",
  "fromName": "string (required)",
  "content": "string (required)",
  "signature": "string (optional)",
  "layout": "modern|minimal|classic",
  "preview": "string (optional)",
  "heroImage": "base64 string or null (optional)",
  "description": "string (optional)",
  "isDefault": "boolean (optional)"
}
```

Response (200 OK):
```javascript
{
  "message": "Template updated successfully",
  "template": {
    "_id": "ObjectId",
    "name": "string",
    // ... all fields ...
    "updatedAt": "ISO date (updated)"
  }
}
```

---

### DELETE /email-templates/:id
**Delete an email template**

Request:
```javascript
// DELETE /email-templates/507f1f77bcf86cd799439011
```

Response (200 OK):
```javascript
{
  "message": "Template deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```javascript
{
  "message": "Missing required fields: name, subject, fromName, content"
}
```

### 404 Not Found
```javascript
{
  "message": "Template not found"
}
```

### 500 Server Error
```javascript
{
  "message": "Error creating template",
  "error": "error details"
}
```

---

## Frontend Usage Example

### Create Template
```javascript
const createTemplate = async (templateData) => {
  try {
    const response = await axios.post(
      'http://localhost:3001/email-templates',
      {
        name: templateData.name,
        subject: templateData.subject,
        fromName: templateData.fromName,
        content: templateData.content,
        signature: templateData.signature,
        layout: templateData.layout,
        preview: templateData.preview,
        heroImage: templateData.heroImage,
        description: templateData.description,
        isDefault: false
      }
    );
    return response.data.template;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};
```

### Retrieve Templates
```javascript
const getTemplates = async () => {
  try {
    const response = await axios.get(
      'http://localhost:3001/email-templates'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};
```

### Update Template
```javascript
const updateTemplate = async (templateId, templateData) => {
  try {
    const response = await axios.put(
      `http://localhost:3001/email-templates/${templateId}`,
      {
        name: templateData.name,
        subject: templateData.subject,
        fromName: templateData.fromName,
        content: templateData.content,
        signature: templateData.signature,
        layout: templateData.layout,
        preview: templateData.preview,
        heroImage: templateData.heroImage,
        description: templateData.description
      }
    );
    return response.data.template;
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
};
```

### Delete Template
```javascript
const deleteTemplate = async (templateId) => {
  try {
    await axios.delete(
      `http://localhost:3001/email-templates/${templateId}`
    );
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};
```

---

## MongoDB Schema

**Collection:** `emailtemplates`

```javascript
{
  _id: ObjectId,           // Auto-generated by MongoDB
  name: String,            // Required
  subject: String,         // Required
  fromName: String,        // Required
  content: String,         // Required, HTML content
  signature: String,       // Optional, email signature
  layout: String,          // Enum: 'modern', 'minimal', 'classic'
  preview: String,         // Optional, short preview
  heroImage: String,       // Optional, base64 encoded image
  description: String,     // Optional, template description
  isDefault: Boolean,      // Default: false
  createdAt: Date,         // Auto-set to current time
  updatedAt: Date          // Auto-updated on every save
}
```

---

## Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| name | String | Yes | Min 1 char, max 255 |
| subject | String | Yes | Min 1 char, max 255 |
| fromName | String | Yes | Min 1 char, max 255 |
| content | String | Yes | Any HTML allowed |
| signature | String | No | Max 1000 chars |
| layout | String | No | Must be: modern, minimal, or classic |
| preview | String | No | Max 500 chars |
| heroImage | String | No | Must be valid base64 if provided |
| description | String | No | Max 500 chars |
| isDefault | Boolean | No | Default: false |

---

## Common Use Cases

### Save Template from Frontend
```javascript
const handleSaveTemplate = async (formData) => {
  const response = await axios.post('/email-templates', {
    name: formData.name,
    subject: formData.subject,
    fromName: formData.fromName,
    content: formData.content,
    signature: formData.signature,
    layout: formData.layout,
    preview: formData.preview,
    heroImage: formData.heroImage
  });
  console.log('Saved with ID:', response.data.template._id);
};
```

### Load All Templates
```javascript
const loadAllTemplates = async () => {
  const templates = await axios.get('/email-templates');
  return templates.data;
};
```

### Update Existing Template
```javascript
const updateExisting = async (templateId, updates) => {
  const response = await axios.put(
    `/email-templates/${templateId}`,
    updates
  );
  console.log('Updated:', response.data.template);
};
```

### Remove Template
```javascript
const removeTemplate = async (templateId) => {
  await axios.delete(`/email-templates/${templateId}`);
  console.log('Deleted');
};
```

---

## Headers

All requests should include:
```
Content-Type: application/json
```

CORS is enabled for:
- http://localhost:3000
- http://localhost:5173
- http://127.0.0.1:5173

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Template successfully created |
| 400 | Bad Request - Validation failed |
| 404 | Not Found - Template doesn't exist |
| 500 | Server Error - Database or server error |

---

## Notes

- All timestamps are in ISO 8601 format
- All responses are JSON
- The `_id` field is MongoDB's unique identifier
- The `updatedAt` field is automatically updated on every save
- Templates are sorted by `createdAt` (newest first) in GET /email-templates
- Deleting a template is permanent
- The heroImage field should be a complete base64 data URL if provided
