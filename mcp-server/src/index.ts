#!/usr/bin/env node
/**
 * RGFL MCP Server
 *
 * Model Context Protocol server for Reality Games Fantasy League - Survivor.
 * Provides AI assistants with access to game data and operations.
 */

import * as Sentry from '@sentry/node';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import 'dotenv/config';

// Initialize Sentry
const sentryDsn = process.env.SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 1.0,
    sendDefaultPii: true,
  });
}

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Create MCP server
const server = new McpServer({
  name: 'rgfl-survivor',
  version: '1.0.0',
});

// Wrap with Sentry if available
const wrappedServer = sentryDsn ? Sentry.wrapMcpServerWithSentry(server) : server;

// ============================================
// RESOURCES - Read-only data access
// ============================================

// Resource: Active Season
server.resource(
  'season/active',
  'season://active',
  async (uri) => {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) throw new Error(`Failed to fetch active season: ${error.message}`);

    return {
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify(data, null, 2),
      }],
    };
  }
);

// Resource: All Castaways for Active Season
server.resource(
  'castaways/active',
  'castaways://active',
  async (uri) => {
    // Get active season first
    const { data: season } = await supabase
      .from('seasons')
      .select('id')
      .eq('is_active', true)
      .single();

    if (!season) throw new Error('No active season found');

    const { data, error } = await supabase
      .from('castaways')
      .select('id, name, tribe_original, tribe_current, status, occupation, hometown, age, photo_url')
      .eq('season_id', season.id)
      .order('name');

    if (error) throw new Error(`Failed to fetch castaways: ${error.message}`);

    return {
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify(data, null, 2),
      }],
    };
  }
);

// Resource: Episodes for Active Season
server.resource(
  'episodes/active',
  'episodes://active',
  async (uri) => {
    const { data: season } = await supabase
      .from('seasons')
      .select('id')
      .eq('is_active', true)
      .single();

    if (!season) throw new Error('No active season found');

    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('season_id', season.id)
      .order('number');

    if (error) throw new Error(`Failed to fetch episodes: ${error.message}`);

    return {
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify(data, null, 2),
      }],
    };
  }
);

// Resource: Leagues Overview
server.resource(
  'leagues/overview',
  'leagues://overview',
  async (uri) => {
    const { data: season } = await supabase
      .from('seasons')
      .select('id')
      .eq('is_active', true)
      .single();

    if (!season) throw new Error('No active season found');

    const { data, error } = await supabase
      .from('leagues')
      .select('id, name, code, is_public, max_members, draft_status, created_at')
      .eq('season_id', season.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch leagues: ${error.message}`);

    return {
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify(data, null, 2),
      }],
    };
  }
);

// Resource: Announcements
server.resource(
  'announcements/active',
  'announcements://active',
  async (uri) => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch announcements: ${error.message}`);

    return {
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify(data, null, 2),
      }],
    };
  }
);

// Resource: Global Leaderboard
server.resource(
  'leaderboard/global',
  'leaderboard://global',
  async (uri) => {
    const { data, error } = await supabase.rpc('get_global_leaderboard', { 
      limit_count: 50,
      offset_count: 0 
    });

    if (error) throw new Error(`Failed to fetch leaderboard: ${error.message}`);

    return {
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify(data, null, 2),
      }],
    };
  }
);

// ============================================
// TOOLS - Actions and mutations
// ============================================

// Tool: Get User Profile
server.tool(
  'get_user',
  'Get a user profile by ID or email',
  {
    identifier: z.string().describe('User ID (UUID) or email address'),
  },
  async ({ identifier }) => {
    const isEmail = identifier.includes('@');
    
    const query = supabase
      .from('users')
      .select('id, email, display_name, role, phone, phone_verified, avatar_url, created_at');
    
    const { data, error } = isEmail
      ? await query.eq('email', identifier).single()
      : await query.eq('id', identifier).single();

    if (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  }
);

// Tool: Get League Details
server.tool(
  'get_league',
  'Get detailed information about a league including members and rosters',
  {
    league_id: z.string().uuid().describe('League ID'),
  },
  async ({ league_id }) => {
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select(`
        *,
        commissioner:users!leagues_commissioner_id_fkey(id, display_name, email)
      `)
      .eq('id', league_id)
      .single();

    if (leagueError) {
      return {
        content: [{ type: 'text', text: `Error: ${leagueError.message}` }],
        isError: true,
      };
    }

    const { data: members } = await supabase
      .from('league_members')
      .select(`
        user_id,
        total_points,
        rank,
        users(display_name, email)
      `)
      .eq('league_id', league_id)
      .order('rank');

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ league, members }, null, 2),
      }],
    };
  }
);

// Tool: Get Castaway Stats
server.tool(
  'get_castaway_stats',
  'Get scoring statistics for a castaway',
  {
    castaway_id: z.string().uuid().describe('Castaway ID'),
  },
  async ({ castaway_id }) => {
    const { data: castaway, error: castawayError } = await supabase
      .from('castaways')
      .select('*')
      .eq('id', castaway_id)
      .single();

    if (castawayError) {
      return {
        content: [{ type: 'text', text: `Error: ${castawayError.message}` }],
        isError: true,
      };
    }

    const { data: scores } = await supabase
      .from('episode_scores')
      .select(`
        episode_id,
        points,
        episodes(number, title, air_date)
      `)
      .eq('castaway_id', castaway_id)
      .order('episodes(number)');

    const totalPoints = scores?.reduce((sum, s) => sum + (s.points || 0), 0) || 0;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          castaway,
          totalPoints,
          episodeScores: scores,
        }, null, 2),
      }],
    };
  }
);

// Tool: Create Announcement
server.tool(
  'create_announcement',
  'Create a new announcement for the dashboard',
  {
    title: z.string().describe('Announcement title'),
    content: z.string().describe('Announcement content/body'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium').describe('Priority level'),
    expires_at: z.string().optional().describe('Expiration date (ISO 8601 format)'),
  },
  async ({ title, content, priority, expires_at }) => {
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        priority,
        is_active: true,
        expires_at: expires_at || null,
      })
      .select()
      .single();

    if (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text',
        text: `Announcement created successfully:\n${JSON.stringify(data, null, 2)}`,
      }],
    };
  }
);

// Tool: Update Castaway Status
server.tool(
  'update_castaway_status',
  'Update a castaway status (active, eliminated, winner)',
  {
    castaway_id: z.string().uuid().describe('Castaway ID'),
    status: z.enum(['active', 'eliminated', 'winner']).describe('New status'),
    placement: z.number().optional().describe('Final placement (for eliminated/winner)'),
  },
  async ({ castaway_id, status, placement }) => {
    const updateData: Record<string, any> = { status };
    if (placement !== undefined) {
      updateData.placement = placement;
    }

    const { data, error } = await supabase
      .from('castaways')
      .update(updateData)
      .eq('id', castaway_id)
      .select()
      .single();

    if (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text',
        text: `Castaway status updated:\n${JSON.stringify(data, null, 2)}`,
      }],
    };
  }
);

// Tool: Get Dashboard Stats
server.tool(
  'get_dashboard_stats',
  'Get overall dashboard statistics for the active season',
  {},
  async () => {
    const { data: season } = await supabase
      .from('seasons')
      .select('id, name, number')
      .eq('is_active', true)
      .single();

    if (!season) {
      return {
        content: [{ type: 'text', text: 'No active season found' }],
        isError: true,
      };
    }

    // Get counts
    const [users, leagues, castaways, episodes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('leagues').select('id', { count: 'exact', head: true }).eq('season_id', season.id),
      supabase.from('castaways').select('id', { count: 'exact', head: true }).eq('season_id', season.id),
      supabase.from('episodes').select('id', { count: 'exact', head: true }).eq('season_id', season.id).eq('is_scored', true),
    ]);

    const stats = {
      season: season,
      totalUsers: users.count || 0,
      totalLeagues: leagues.count || 0,
      totalCastaways: castaways.count || 0,
      episodesScored: episodes.count || 0,
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }],
    };
  }
);

// Tool: Search Users
server.tool(
  'search_users',
  'Search for users by display name or email',
  {
    query: z.string().describe('Search query (partial match on display_name or email)'),
    limit: z.number().default(10).describe('Maximum results to return'),
  },
  async ({ query, limit }) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name, role, created_at')
      .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text',
        text: `Found ${data.length} users:\n${JSON.stringify(data, null, 2)}`,
      }],
    };
  }
);

// Tool: Run SQL Query (Read-only)
server.tool(
  'run_query',
  'Run a read-only SQL query against the database (SELECT only)',
  {
    sql: z.string().describe('SQL SELECT query to execute'),
  },
  async ({ sql }) => {
    // Security: Only allow SELECT queries
    const trimmedSql = sql.trim().toLowerCase();
    if (!trimmedSql.startsWith('select')) {
      return {
        content: [{ type: 'text', text: 'Error: Only SELECT queries are allowed' }],
        isError: true,
      };
    }

    // Block dangerous keywords
    const dangerous = ['insert', 'update', 'delete', 'drop', 'alter', 'create', 'truncate', 'grant', 'revoke'];
    for (const keyword of dangerous) {
      if (trimmedSql.includes(keyword)) {
        return {
          content: [{ type: 'text', text: `Error: Query contains forbidden keyword: ${keyword}` }],
          isError: true,
        };
      }
    }

    const { data, error } = await supabase.rpc('execute_readonly_query', { query_text: sql });

    if (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  }
);

// ============================================
// PROMPTS - Reusable prompt templates
// ============================================

server.prompt(
  'analyze_league',
  'Analyze a league\'s performance and provide insights',
  {
    league_id: z.string().uuid().describe('League ID to analyze'),
  },
  async ({ league_id }) => {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Please analyze league ${league_id}. Use the get_league tool to fetch the league details, then provide insights on:
1. League activity and member engagement
2. Point distribution among members
3. Draft strategy effectiveness
4. Recommendations for the commissioner`,
        },
      }],
    };
  }
);

server.prompt(
  'weekly_recap',
  'Generate a weekly recap for the fantasy league',
  {},
  async () => {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Generate a weekly recap for the Survivor Fantasy League. Use the available resources to:
1. Summarize the latest episode results
2. Highlight top performers
3. Note any major leaderboard changes
4. Preview what's coming next week

Make it engaging and fun for fantasy players!`,
        },
      }],
    };
  }
);

// ============================================
// START SERVER
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await wrappedServer.connect(transport);
  console.error('RGFL MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  Sentry.captureException(error);
  process.exit(1);
});
