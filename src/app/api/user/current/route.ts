import { NextResponse } from 'next/server';
import { getUser } from '@/sanity/lib/user/getUser';

export async function GET() {
  try {
    console.log('API route: Starting to fetch user...');
    const result = await getUser();
    console.log('API route: getUser result:', result);
    
    if ('error' in result) {
      console.log('API route: User not found, error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    
    console.log('API route: Returning user data:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API route: Error fetching current user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
