/**
 * Replace Season 50 Castaways
 * Deletes all existing Season 50 castaways and inserts the new correct cast
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qxrgejdfxcvsfktgysop.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// New Season 50 castaways data
const newCastaways = [
  // VATU TRIBE (Purple) - 8 castaways
  {
    name: 'Colby Donaldson',
    age: 51,
    hometown: 'Los Angeles, CA',
    occupation: 'TV Personality',
    status: 'active' as const,
    previous_seasons: ['Australian Outback (S2)', 'All-Stars (S8)', 'Heroes vs Villains (S20)'],
    best_placement: 2,
    fun_fact: 'Won record 5 consecutive individual immunities in Australian Outback; nicknamed \'Superman in a fat suit\' by Coach',
    tribe_original: 'Vatu',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/colby-donaldson.jpg',
  },
  {
    name: 'Stephenie LaGrossa Kendrick',
    age: 45,
    hometown: 'Philadelphia, PA',
    occupation: 'TV Personality',
    status: 'active' as const,
    previous_seasons: ['Palau (S10)', 'Guatemala (S11)', 'Heroes vs Villains (S20)'],
    best_placement: 2,
    fun_fact: 'Last Ulong member after tribe lost every immunity challenge; first player to vote out all original tribemates',
    tribe_original: 'Vatu',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/stephenie-lagrossa.jpg',
  },
  {
    name: 'Aubry Bracco',
    age: 39,
    hometown: 'Los Angeles, CA',
    occupation: 'TV Personality',
    status: 'active' as const,
    previous_seasons: ['Kaôh Rōng (S32)', 'Game Changers (S34)', 'Edge of Extinction (S38)'],
    best_placement: 2,
    fun_fact: 'Lost 15 lbs in Game Changers; played on yellow/blue tribes all 3 seasons; tied with Rob M for fastest 4 seasons (18-season span)',
    tribe_original: 'Vatu',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/aubry-bracco.jpg',
  },
  {
    name: 'Angelina Keeley',
    age: 35,
    hometown: 'San Clemente, CA',
    occupation: 'TV Personality',
    status: 'active' as const,
    previous_seasons: ['David vs Goliath (S37)'],
    best_placement: 3,
    fun_fact: '\'Can I have your jacket?\' moment with Natalie; climbed 100 feet for rice; received 0 jury votes; negotiated rice deal with Jeff',
    tribe_original: 'Vatu',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/angelina-keeley.jpg',
  },
  {
    name: 'Q Burdette',
    age: 31,
    hometown: 'Memphis, TN',
    occupation: 'Former College Football Player',
    status: 'active' as const,
    previous_seasons: ['Season 46'],
    best_placement: 5,
    fun_fact: 'Former college football player; attempted to get voted out then changed mind; unpredictable gameplay; chaotic strategist',
    tribe_original: 'Vatu',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/q-burdette.jpg',
  },
  {
    name: 'Genevieve Mushaluk',
    age: 34,
    hometown: 'Winnipeg, MB',
    occupation: 'Corporate Lawyer',
    status: 'active' as const,
    previous_seasons: ['Season 47'],
    best_placement: 3,
    fun_fact: 'Corporate lawyer from Canada; strategic force in S47; started emotionless, learned emotion was key to her game',
    tribe_original: 'Vatu',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/genevieve-mushaluk.jpg',
  },
  {
    name: 'Kyle Fraser',
    age: 32,
    hometown: 'Brooklyn, NY',
    occupation: 'Attorney',
    status: 'active' as const,
    previous_seasons: ['Season 48'],
    best_placement: 1,
    fun_fact: 'Attorney; won with \'people first\' strategy via secret alliance with Kamilla; first male winner since S39 to win Final Immunity',
    tribe_original: 'Vatu',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/kyle-fraser.jpg',
  },
  {
    name: 'Rizo Velovic',
    age: 25,
    hometown: 'Yonkers, NY',
    occupation: 'TV Personality',
    status: 'active' as const,
    previous_seasons: ['Season 49'],
    best_placement: 4,
    fun_fact: 'Lost fire-making to Savannah; held idol for record 9 Tribal Councils; identity kept secret until S49 aired; nicknamed \'Rizgod\'',
    tribe_original: 'Vatu',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rizo-velovic.jpg',
  },
  // KALO TRIBE (Teal) - 8 castaways
  {
    name: 'Coach Wade',
    age: 53,
    hometown: 'Susanville, CA',
    occupation: 'Symphony Conductor',
    status: 'active' as const,
    previous_seasons: ['Tocantins (S18)', 'Heroes vs Villains (S20)', 'South Pacific (S23)'],
    best_placement: 2,
    fun_fact: '\'The Dragon Slayer\'; symphony conductor; wrote \'DRAGONSLAYER\' with votes in HvV',
    tribe_original: 'Kalo',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/coach-wade.jpg',
  },
  {
    name: 'Chrissy Hofbeck',
    age: 54,
    hometown: 'Lebanon Township, NJ',
    occupation: 'Actuarial Analyst',
    status: 'active' as const,
    previous_seasons: ['Heroes vs Healers vs Hustlers (S35)'],
    best_placement: 2,
    fun_fact: 'Won 4 individual immunities; actuarial analyst; oldest woman to win individual immunity at time; received Super Idol Day 1',
    tribe_original: 'Kalo',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/chrissy-hofbeck.jpg',
  },
  {
    name: 'Mike White',
    age: 54,
    hometown: 'Los Angeles, CA',
    occupation: 'TV Writer/Producer',
    status: 'active' as const,
    previous_seasons: ['David vs Goliath (S37)'],
    best_placement: 2,
    fun_fact: 'Creator of \'The White Lotus\' (3 Emmy wins); wrote \'School of Rock\'; won F4 fire-making; cast S37 players in White Lotus cameos',
    tribe_original: 'Kalo',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/mike-white.jpg',
  },
  {
    name: 'Jonathan Young',
    age: 32,
    hometown: 'Gulf Shores, AL',
    occupation: 'Beach Training Instructor',
    status: 'active' as const,
    previous_seasons: ['Season 42'],
    best_placement: 6,
    fun_fact: 'Beach training instructor; went viral for physical strength; challenge beast who single-handedly won tribal challenges',
    tribe_original: 'Kalo',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/jonathan-young.jpg',
  },
  {
    name: 'Dee Valladares',
    age: 28,
    hometown: 'Miami, FL',
    occupation: 'TV Personality',
    status: 'active' as const,
    previous_seasons: ['Season 45'],
    best_placement: 1,
    fun_fact: 'First Latina Sole Survivor in new era; dominant strategic game; showmance with Austin; received 5 of 8 jury votes',
    tribe_original: 'Kalo',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/dee-valladares.jpg',
  },
  {
    name: 'Tiffany Nicole Ervin',
    age: 34,
    hometown: 'Elizabeth, NJ',
    occupation: 'Artist and Content Creator',
    status: 'active' as const,
    previous_seasons: ['Season 46'],
    best_placement: 3,
    fun_fact: 'Artist and content creator; strong social connections; worked closely with Q despite frustrations',
    tribe_original: 'Kalo',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/tiffany-ervin.jpg',
  },
  {
    name: 'Charlie Davis',
    age: 27,
    hometown: 'Boston, MA',
    occupation: 'Harvard Law Graduate',
    status: 'active' as const,
    previous_seasons: ['Season 46'],
    best_placement: 2,
    fun_fact: 'Harvard Law graduate; tight alliance with winner Kenzie; strong strategic game; Taylor Swift fan (cruel summer reference from Jeff)',
    tribe_original: 'Kalo',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/charlie-davis.jpg',
  },
  {
    name: 'Kamilla Karthigesu',
    age: 31,
    hometown: 'Foster City, CA',
    occupation: 'Tech Professional',
    status: 'active' as const,
    previous_seasons: ['Season 48'],
    best_placement: 3,
    fun_fact: 'Tech professional; came in with self-doubt, emerged as an \'assassin\'; strategic gameplay with strong social bonds',
    tribe_original: 'Kalo',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/kamilla-karthigesu.jpg',
  },
  // CILA TRIBE (Orange) - 8 castaways
  {
    name: 'Jenna Lewis-Dougherty',
    age: 47,
    hometown: 'Burbank, CA',
    occupation: 'TV Personality',
    status: 'active' as const,
    previous_seasons: ['Borneo (S1)', 'All-Stars (S8)'],
    best_placement: 3,
    fun_fact: 'Only Borneo contestant to make merge in All-Stars; 42-season gap record (breaking Amber/Ethan\'s 32); only S50 player never filmed in HD',
    tribe_original: 'Cila',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/jenna-lewis.jpg',
  },
  {
    name: 'Cirie Fields',
    age: 54,
    hometown: 'Norwalk, CT',
    occupation: 'Nurse',
    status: 'active' as const,
    previous_seasons: ['Panama (S12)', 'Micronesia (S16)', 'Heroes vs Villains (S20)', 'Game Changers (S34)', 'AU Season 11: Australia v The World'],
    best_placement: 3,
    fun_fact: 'First player to compete 6 times; eliminated by \'Advantageddon\' with zero votes; never voted out by majority vote; won The Traitors Season 1',
    tribe_original: 'Cila',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/cirie-fields.jpg',
  },
  {
    name: 'Ozzy Lusth',
    age: 43,
    hometown: 'Venice, CA',
    occupation: 'TV Personality',
    status: 'active' as const,
    previous_seasons: ['Cook Islands (S13)', 'Micronesia (S16)', 'South Pacific (S23)', 'Game Changers (S34)'],
    best_placement: 2,
    fun_fact: 'Most times voted out (5 times); voted out 3 times in single season (South Pacific); record 128 days played',
    tribe_original: 'Cila',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/ozzy-lusth.jpg',
  },
  {
    name: 'Christian Hubicki',
    age: 39,
    hometown: 'Tallahassee, FL',
    occupation: 'Robotics Scientist',
    status: 'active' as const,
    previous_seasons: ['David vs Goliath (S37)'],
    best_placement: 7,
    fun_fact: 'Robotics scientist; survived 5-hour endurance challenge; \'Slamtown\' alliance; fan favorite for strategic/social game',
    tribe_original: 'Cila',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/christian-hubicki.jpg',
  },
  {
    name: 'Rick Devens',
    age: 41,
    hometown: 'Macon, GA',
    occupation: 'TV News Anchor',
    status: 'active' as const,
    previous_seasons: ['Edge of Extinction (S38)'],
    best_placement: 4,
    fun_fact: 'TV news anchor; returned from Edge of Extinction; found multiple idols in final days; lost F4 fire-making to Chris Underwood',
    tribe_original: 'Cila',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rick-devens.jpg',
  },
  {
    name: 'Emily Flippen',
    age: 30,
    hometown: 'Laurel, MD',
    occupation: 'Investment Analyst',
    status: 'active' as const,
    previous_seasons: ['Season 45'],
    best_placement: 4,
    fun_fact: 'Investment analyst; redemption arc from social outcast to fan favorite; started game poorly but became beloved',
    tribe_original: 'Cila',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/emily-flippen.jpg',
  },
  {
    name: 'Joe Hunter',
    age: 45,
    hometown: 'West Sacramento, CA',
    occupation: 'Fire Captain',
    status: 'active' as const,
    previous_seasons: ['Season 48'],
    best_placement: 4,
    fun_fact: 'Fire captain; played one of most emotional and loyal games ever while dominating challenges physically',
    tribe_original: 'Cila',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/joe-hunter.jpg',
  },
  {
    name: 'Savannah Louie',
    age: 31,
    hometown: 'Atlanta, GA',
    occupation: 'Former Reporter',
    status: 'active' as const,
    previous_seasons: ['Season 49'],
    best_placement: 1,
    fun_fact: 'Won 5-2-1; tied record for most female immunity wins (4); defeated Rizo in fire-making; former reporter turned Sole Survivor',
    tribe_original: 'Cila',
    photo_url: 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/savannah-louie.jpg',
  },
];

async function main() {
  console.log('🔄 Replacing Season 50 castaways...\n');

  // Get Season 50 ID
  const { data: season, error: seasonError } = await supabase
    .from('seasons')
    .select('id')
    .eq('number', 50)
    .single();

  if (seasonError || !season) {
    console.error('❌ Season 50 not found:', seasonError);
    process.exit(1);
  }

  const seasonId = season.id;
  console.log(`✅ Found Season 50 (ID: ${seasonId})\n`);

  // Delete all existing Season 50 castaways
  console.log('🗑️  Deleting existing castaways...');
  const { error: deleteError } = await supabase
    .from('castaways')
    .delete()
    .eq('season_id', seasonId);

  if (deleteError) {
    console.error('❌ Error deleting castaways:', deleteError);
    process.exit(1);
  }
  console.log('✅ Deleted existing castaways\n');

  // Insert new castaways
  console.log(`📝 Inserting ${newCastaways.length} new castaways...\n`);
  
  for (const castaway of newCastaways) {
    const { error: insertError } = await supabase
      .from('castaways')
      .insert({
        season_id: seasonId,
        ...castaway,
      });

    if (insertError) {
      console.error(`❌ Error inserting ${castaway.name}:`, insertError);
    } else {
      console.log(`✅ ${castaway.name} (${castaway.tribe_original})`);
    }
  }

  // Verify
  console.log('\n📊 Verifying...');
  const { data: castaways, error: verifyError } = await supabase
    .from('castaways')
    .select('name, tribe_original')
    .eq('season_id', seasonId)
    .order('tribe_original')
    .order('name');

  if (verifyError) {
    console.error('❌ Error verifying:', verifyError);
  } else {
    console.log(`\n✅ Total castaways: ${castaways?.length || 0}`);
    const byTribe = castaways?.reduce((acc, c) => {
      acc[c.tribe_original || 'Unknown'] = (acc[c.tribe_original || 'Unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('📊 By tribe:', byTribe);
  }
}

main().catch(console.error);
