import axios from "axios";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import Segmentsearch from "../Models/SegmentSearch";
import Segmentsearchupdate from "../Models/SegmentSearchUpdate";

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [show, setShow] = useState(false);
  const [showupdate, setShowUpdate] = useState(false);
  const [selectedSegmentIds, setSelectedSegmentIds] = useState([]);

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

  // Remove segment handler
  const handleRemoveSegments = async () => {
    if (selectedSegmentIds.length === 0) return;
    if (!window.confirm("Are you sure you want to delete the selected segments?")) return;
    try {
      await axios.post("http://localhost:3001/segments/delete-many", { ids: selectedSegmentIds });
      setSegments(prev => prev.filter(seg => !selectedSegmentIds.includes(seg._id)));
      setSelectedSegmentIds([]);
    } catch (error) {
      alert("Error deleting segments.");
    }
  };

  // Find the selected segment objects
  const selectedSegments = segments.filter(seg => selectedSegmentIds.includes(seg._id));

  return (
    <div className="ml-0 h-screen w-screen bg-zinc-950 overflow-x-auto">
      <div className="ml-64 h-screen overflow-y-auto flex flex-col gap-6 px-6 py-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white m-0 mb-1">Email Segments</h1>
          <p className="text-zinc-400 text-sm m-0">Create and manage audience segments for targeted campaigns</p>
        </div>

        {/* Button Group */}
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <button onClick={() => setShow(true)} className="flex-1 sm:flex-none bg-lime-500 hover:bg-lime-600 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Search and Create
          </button>
          <button
            onClick={() => setShowUpdate(true)}
            disabled={selectedSegmentIds.length !== 1}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Edit className="w-5 h-5" /> Update
          </button>
          <button
            onClick={handleRemoveSegments}
            disabled={selectedSegmentIds.length === 0}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" /> Remove ({selectedSegmentIds.length})
          </button>
        </div>

        {/* Popover modals */}
        <Segmentsearch open={show} onClose={() => setShow(false)} />
        <Segmentsearchupdate
          open={showupdate}
          onClose={() => setShowUpdate(false)}
          editingSegment={segments.find(seg => seg._id === selectedSegmentIds[0])}
          isEdit={true}
        />

        {/* Table Wrapper */}
        <div className="flex-1 overflow-y-auto border border-zinc-700 rounded-lg bg-zinc-900 shadow-xl">
          {/* Table */}
          {segments.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-white mb-2 m-0">No segments yet</h3>
              <p className="text-base m-0">Create your first segment to organize your contacts!</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead className="bg-zinc-800 border-b border-zinc-700 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedSegmentIds.length === segments.length && segments.length > 0}
                      onChange={() => {
                        if (selectedSegmentIds.length === segments.length) {
                          setSelectedSegmentIds([]);
                        } else {
                          setSelectedSegmentIds(segments.map(seg => seg._id));
                        }
                      }}
                      className="cursor-pointer accent-lime-500"
                    />
                  </th>
                  <th className="p-3 text-left text-lime-400 font-bold">Name</th>
                  <th className="p-3 text-left text-lime-400 font-bold">Description</th>
                  <th className="p-3 text-left text-lime-400 font-bold">Contacts</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((segment, index) => (
                  <tr key={segment._id} className={`border-b border-zinc-700 ${index % 2 === 0 ? 'bg-zinc-800' : 'bg-zinc-900'}`}>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedSegmentIds.includes(segment._id)}
                        onChange={() => {
                          setSelectedSegmentIds(prev =>
                            prev.includes(segment._id)
                              ? prev.filter(id => id !== segment._id)
                              : [...prev, segment._id]
                          );
                        }}
                        className="cursor-pointer accent-lime-500"
                      />
                    </td>
                    <td className="p-3 text-zinc-200 font-semibold">{segment.name}</td>
                    <td className="p-3 text-zinc-400">{segment.description}</td>
                    <td className="p-3">
                      {segment.contacts && segment.contacts.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {segment.contacts.slice(0, 3).map(email => (
                            <div key={email._id} className="bg-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded-full whitespace-nowrap truncate max-w-xs" title={`${email.name} (${email.email})`}>
                              {email.name}
                            </div>
                          ))}
                          {segment.contacts.length > 3 && (
                            <div className="bg-lime-500/20 text-lime-400 text-xs px-2 py-1 rounded-full font-semibold">
                              +{segment.contacts.length - 3} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">No contacts</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

