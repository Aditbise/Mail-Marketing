import axios from "axios";
import { useEffect, useState } from "react";
import Segmentsearch from "../Models/Segmentsearch";

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const response = await axios.get("http://localhost:3001/segments");
        setSegments(response.data);
      } catch (error) {
        console.error("Error fetching segments:", error);
      }
    };
    fetchSegments();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Email Segments</h2>

      {/* Open Modal Button */}
      <button onClick={() => setShow(true)}>Search</button>

      {/* Popover modal */}
      <Segmentsearch open={show} onClose={() => setShow(false)} />

      {/* Table */}
      <table border="1" cellPadding="10" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((segment) => (
            <tr key={segment._id}>
              <td>{segment.name}</td>
              <td>{segment.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
