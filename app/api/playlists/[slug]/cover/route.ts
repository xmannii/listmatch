import { NextRequest, NextResponse } from "next/server";

// Generate a gradient color based on playlist name
function generateGradient(name: string): { from: string; to: string } {
  // Create a hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate colors based on hash
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 60) % 360;
  
  // Convert to OKLCH colors (matching your theme)
  const saturation = 0.25;
  const lightness1 = 0.6;
  const lightness2 = 0.5;
  
  return {
    from: `oklch(${lightness1} ${saturation} ${hue1})`,
    to: `oklch(${lightness2} ${saturation} ${hue2})`,
  };
}

// Get initials from playlist name
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return "?";
  
  if (words.length === 1) {
    // Single word - take first 2 letters
    return name.substring(0, 2).toUpperCase();
  }
  
  // Multiple words - take first letter of first 2 words
  return (words[0][0] + words[1][0]).toUpperCase();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name") || "Playlist";

    const { from, to } = generateGradient(name);
    const initials = getInitials(name);

    // Return SVG as data URL
    const svg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${from};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${to};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#grad)" rx="16"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="120" 
          font-weight="bold" 
          fill="white" 
          text-anchor="middle" 
          dominant-baseline="central"
          opacity="0.9"
        >${initials}</text>
      </svg>
    `.trim();

    const base64 = Buffer.from(svg).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64}`;

    return NextResponse.json({ coverUrl: dataUrl });
  } catch (error) {
    console.error("Error generating cover:", error);
    return NextResponse.json(
      { error: "Failed to generate cover" },
      { status: 500 }
    );
  }
}

