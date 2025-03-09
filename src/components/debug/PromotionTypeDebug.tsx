import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function PromotionTypeDebug() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get table structure
        const { data: tableInfo, error: tableError } = await supabase.rpc(
          "get_table_info",
          { table_name: "promotion_type" }
        );

        if (tableError) {
          console.error("Error fetching table structure:", tableError);
          setError(`Table structure error: ${tableError.message}`);
        } else {
          console.log("Promotion Type table structure:", tableInfo);
        }

        // Get table data
        const { data, error: dataError } = await supabase
          .from("promotion_type")
          .select("*");

        if (dataError) {
          console.error("Error fetching promotion types:", dataError);
          setError(`Data error: ${dataError.message}`);
        } else {
          setRawData(data || []);
          console.log("Raw promotion type data:", data);
        }
      } catch (err: any) {
        console.error("Unexpected error:", err);
        setError(`Unexpected error: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-lg font-bold mb-2">Promotion Type Debug</h2>

      <h3 className="font-semibold mt-4">
        Raw Data ({rawData.length} records):
      </h3>
      <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-96 text-xs">
        {JSON.stringify(rawData, null, 2)}
      </pre>

      <h3 className="font-semibold mt-4">Column Structure:</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead>
            <tr>
              <th className="border p-2">Column</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Sample Values</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(rawData[0] || {}).map((key) => (
              <tr key={key}>
                <td className="border p-2 font-mono">{key}</td>
                <td className="border p-2 font-mono">
                  {Array.isArray(rawData[0][key])
                    ? "array"
                    : typeof rawData[0][key]}
                </td>
                <td className="border p-2 font-mono">
                  {rawData.slice(0, 3).map((item, i) => (
                    <div key={i} className="mb-1">
                      {JSON.stringify(item[key]).substring(0, 30)}
                      {JSON.stringify(item[key]).length > 30 ? "..." : ""}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
