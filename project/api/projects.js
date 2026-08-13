export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const token = process.env.SUPABASE_ACCESS_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: "SUPABASE_ACCESS_TOKEN is not configured",
      });
    }

    const response = await fetch(
      "https://api.supabase.com/v1/projects",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to fetch Supabase projects",
    });
  }
}
