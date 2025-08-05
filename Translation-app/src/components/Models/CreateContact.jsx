// import { useState } from "react";

// export default function CreateContact() {
//   return (
//     <div>
//       <h2>Name</h2>
//       <form>
//         <input type="text" placeholder="Enter First name" />
//         <input type="text" placeholder="Enter Last name" />
//         <br />
//         <h2>Email</h2>
//         <input type="email" className="contactinfo" placeholder="Email" />
//         <h2>Company</h2>
//         <div className="spaceinbetween">
//           <input type="text" placeholder="Name" />
//           <input type="text" placeholder="Position" />
//         </div>
//         <h2>Address</h2>
//         <div className="spaceinbetween">
//           <input
//             type="text"
//             placeholder="Address Line 1"
//             style={{ width: "300px", height: "30px" }}
//           />
//           <input
//             type="text"
//             placeholder="Address Line 2"
//             style={{ width: "300px", height: "30px" }}
//           />
//           <input type="text" placeholder="City" />
//           <input type="text" placeholder="State" />
//           <input type="text" placeholder="Code" />
//           <input type="text" placeholder="Country" />
//         </div>
//         <h2>Attribution</h2>
//         <div className="spaceinbetween">
//           <input type="text" placeholder="Attribution" />
//           <input type="date" placeholder="Attribution Date" />
//         </div>
//         <h2>Mobile</h2>
//         <div className="spaceinbetween">
//           <input type="phone" placeholder="" />
//         </div>
//       </form>
//     </div>
//   );
// }

// export function QuickAddContact({ showQuickAdd, setShowQuickAdd }) {
//   const [formdata, setFormData] = useState({
//     email: "",
//     firstName: "",
//     lastName: "",
//     tel: ""
//   });

//   const setdata = (e) => {
//     setFormData({
//       ...formdata,
//       [e.target.name]: e.target.value
//     });
//   };

//   async function savedata(e) {
//   e.preventDefault();
//   console.log(setdata);

//   const response = await fetch("http://localhost:5678/webhook-test/bbc905f8-da05-43a6-bd77-5c1d35a9cbbd", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       action: "createcontact",
//       email: formdata.email,
//       firstName: formdata.firstName,
//       lastName: formdata.lastName,
//       tel: formdata.tel,
//       contactID: "1"  
//     })
//   });

//   const text = await response.text();
//   if (text) {
//     try {
//       console.log("Saved data:", JSON.parse(text));
//     } catch {
//       console.log("Webhook response (not JSON):", text);
//     }
//   } else {
//     console.log("Webhook returned empty response");
//   }
// }


//   if (!showQuickAdd) return null; // ✅ Hide modal when false

//   return (
//     <div className="modal">
//       <h2>Quick Add</h2>
//       <form onSubmit={savedata}>
//         <div>
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             onChange={setdata}
//           />
//           <input
//             type="text"
//             name="firstName"
//             placeholder="First name"
//             onChange={setdata}
//           />
//           <input
//             type="text"
//             name="lastName"
//             placeholder="Last name"
//             onChange={setdata}
//           />
//           <input
//             type="tel"
//             name="tel"
//             placeholder="Contact Number"
//             onChange={setdata}
//           />
//         </div>

//         <button type="submit">Save</button>&nbsp;
//         <button type="button" onClick={() => setShowQuickAdd(false)}>
//           Close
//         </button>
//       </form>
//     </div>
//   );
// }
import { useState } from "react";

export default function CreateContact() {
  const [formdata, setFormData] = useState({
    title: "",
    firstname: "",
    lastname: "",
    email: "",
    company: "",
    position: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    attribution: "",
    attribution_date: "",
    mobile: "",
    phone: "",
    fax: "",
    points: 0,
    preferred_locale: "",
    timezone: "",
    last_active: "",
    website: "",
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
    skype: "",
    foursquare: "",
    stage: "",
    contact_owner: "admin",
    tags: ""
  });

  const setdata = (e) => {
    setFormData({
      ...formdata,
      [e.target.name]: e.target.value
    });
  };
async function savedata(e) {
  e.preventDefault();

  // ✅ Filter out empty or blank fields
  const filteredPayload = Object.fromEntries(
    Object.entries(formdata).filter(([_, value]) => value && value.trim() !== "")
  );

  // ✅ Final payload for Mautic
  const payload = {
    action: "createcontact",
    ...filteredPayload
  };

  try {
    const response = await fetch(
      "http://localhost:5678/webhook/05c53425-8a0a-4286-b059-655216aef441",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const text = await response.text();

    if (text) {
      try {
        console.log("Saved data:", JSON.parse(text));
      } catch {
        console.log("Webhook response (not JSON):", text);
      }
    } else {
      console.log("Payload to webhook:", payload);
      console.log("Webhook returned empty response (OK)");
    }
  } catch (err) {
    console.error("Error sending to webhook:", err);
  }
}

  return (
    <div>
      <h2>Contact Information</h2>
      <form onSubmit={savedata}>
        {/* Title */}
        <h2>Title</h2>
        <select name="title" value={formdata.title} onChange={setdata}>
          <option value="">Select Title</option>
          <option value="Mr">Mr</option>
          <option value="Mrs">Mrs</option>
          <option value="Miss">Miss</option>
        </select>

        {/* Name */}
        <h2>Name</h2>
        <input
          type="text"
          name="firstname"
          placeholder="Enter First name"
          value={formdata.firstname}
          onChange={setdata}
        />
        <input
          type="text"
          name="lastname"
          placeholder="Enter Last name"
          value={formdata.lastname}
          onChange={setdata}
        />
        <br />

        {/* Email */}
        <h2>Email</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formdata.email}
          onChange={setdata}
        />

        {/* Company & Position */}
        <h2>Company</h2>
        <div className="spaceinbetween">
          <input
            type="text"
            name="company"
            placeholder="Primary company"
            value={formdata.company}
            onChange={setdata}
          />
          <input
            type="text"
            name="position"
            placeholder="Position"
            value={formdata.position}
            onChange={setdata}
          />
        </div>

        {/* Address */}
        <h2>Address</h2>
        <div className="spaceinbetween">
          <input
            type="text"
            name="address1"
            placeholder="Address Line 1"
            value={formdata.address1}
            onChange={setdata}
            style={{ width: "300px", height: "30px" }}
          />
          <input
            type="text"
            name="address2"
            placeholder="Address Line 2"
            value={formdata.address2}
            onChange={setdata}
            style={{ width: "300px", height: "30px" }}
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formdata.city}
            onChange={setdata}
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formdata.state}
            onChange={setdata}
          />
          <input
            type="text"
            name="zipcode"
            placeholder="Zip Code"
            value={formdata.zipcode}
            onChange={setdata}
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formdata.country}
            onChange={setdata}
          />
        </div>

        {/* Attribution */}
        <h2>Attribution</h2>
        <div className="spaceinbetween">
          <input
            type="number"
            name="attribution"
            placeholder="Attribution"
            value={formdata.attribution}
            onChange={setdata}
          />
          <input
            type="date"
            name="attribution_date"
            value={formdata.attribution_date}
            onChange={setdata}
          />
        </div>

        {/* Phones */}
        <h2>Contact Numbers</h2>
        <div className="spaceinbetween">
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={formdata.mobile}
            onChange={setdata}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formdata.phone}
            onChange={setdata}
          />
          <input
            type="tel"
            name="fax"
            placeholder="Fax"
            value={formdata.fax}
            onChange={setdata}
          />
        </div>

        {/* Points */}
        <h2>Points</h2>
        <input
          type="number"
          name="points"
          placeholder="Points"
          value={formdata.points}
          onChange={setdata}
        />

        {/* Locale & Timezone */}
        <h2>Preferred Locale</h2>
        <select
          name="preferred_locale"
          value={formdata.preferred_locale}
          onChange={setdata}
        >
          <option value="">Preferred Locale</option>
          <option value="en_US">English (US)</option>
          <option value="en_GB">English (UK)</option>
          <option value="fr_FR">French</option>
        </select>

        <h2>Preferred Timezone</h2>
        <select name="timezone" value={formdata.timezone} onChange={setdata}>
          <option value="">Preferred Timezone</option>
          <option value="UTC">UTC</option>
          <option value="Asia/Kolkata">Asia/Kolkata</option>
          <option value="Europe/London">Europe/London</option>
        </select>

        {/* Last Active */}
        <h2>Date Last Active</h2>
        <input
          type="date"
          name="last_active"
          value={formdata.last_active}
          onChange={setdata}
        />

        {/* Website */}
        <h2>Website</h2>
        <input
          type="url"
          name="website"
          placeholder="Website"
          value={formdata.website}
          onChange={setdata}
        />

        {/* Social Media */}
        <h2>Social Links</h2>
        <input
          type="text"
          name="facebook"
          placeholder="Facebook"
          value={formdata.facebook}
          onChange={setdata}
        />
        <input
          type="text"
          name="twitter"
          placeholder="Twitter"
          value={formdata.twitter}
          onChange={setdata}
        />
        <input
          type="text"
          name="linkedin"
          placeholder="LinkedIn"
          value={formdata.linkedin}
          onChange={setdata}
        />
        <input
          type="text"
          name="instagram"
          placeholder="Instagram"
          value={formdata.instagram}
          onChange={setdata}
        />
        <input
          type="text"
          name="skype"
          placeholder="Skype"
          value={formdata.skype}
          onChange={setdata}
        />
        <input
          type="text"
          name="foursquare"
          placeholder="Foursquare"
          value={formdata.foursquare}
          onChange={setdata}
        />

        {/* Stage */}
        <h2>Stage</h2>
        <select name="stage" value={formdata.stage} onChange={setdata}>
          <option value="">Choose one...</option>
          <option value="lead">Lead</option>
          <option value="customer">Customer</option>
          <option value="partner">Partner</option>
        </select>

        {/* Contact Owner */}
        <h2>Contact Owner</h2>
        <select
          name="contact_owner"
          value={formdata.contact_owner}
          onChange={setdata}
        >
          <option value="admin">ad, admin</option>
        </select>

        {/* Tags */}
        <h2>Tags</h2>
        <input
          type="text"
          name="tags"
          placeholder="Select or type in a new tag"
          value={formdata.tags}
          onChange={setdata}
        />

        {/* Save + Cancel */}
        <div style={{ marginTop: "20px" }}>
          <button type="submit">Save</button>&nbsp;
          <button type="button" onClick={() => console.log("Cancel clicked!")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export function QuickAddContact({ showQuickAdd, setShowQuickAdd }) {
  const [formdata, setFormData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    mobile: ""
  });

  const setdata = (e) => {
    setFormData({
      ...formdata,
      [e.target.name]: e.target.value
    });
  };

  async function savedata(e) {
    e.preventDefault();

    const payload = {
      action: "createcontact",
      email: formdata.email,     
      firstname: formdata.firstname,
      lastname: formdata.lastname,
      mobile: formdata.mobile  
    };

    try {
      const response = await fetch(
        "http://localhost:5678/webhook/05c53425-8a0a-4286-b059-655216aef441",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const text = await response.text();

      if (text) {
        try {
          console.log("Saved data:", JSON.parse(text));
        } catch {
          console.log("Webhook response (not JSON):", text);
        }
      } else {
        console.log("Webhook returned empty response (OK)");
      }

      setShowQuickAdd(false);
    } catch (err) {
      console.error("Error sending to webhook:", err);
    }
  }

  if (!showQuickAdd) return null;

  return (
    <div className="modal">
      <h2>Quick Add</h2>
      <form onSubmit={savedata}>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={setdata}
          />
          <input
            type="text"
            name="firstname"
            placeholder="First name"
            onChange={setdata}
          />
          <input
            type="text"
            name="lastname"
            placeholder="Last name"
            onChange={setdata}
          />
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            onChange={setdata}
          />
        </div>

        <button type="submit">Save</button>&nbsp;
        <button type="button" onClick={() => setShowQuickAdd(false)}>
          Close
        </button>
      </form>
    </div>
  );
}
