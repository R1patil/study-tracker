import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // If Google returned an error, go back to login
    if (error) {
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
    }

    if (code) {
        const supabase = await createClient();
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        if (sessionError) {
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(sessionError.message)}`);
        }
    }

    // Use absolute URL to ensure proper redirect after session is set
    const redirectUrl = new URL("/dashboard", origin);
    return NextResponse.redirect(redirectUrl);
}
