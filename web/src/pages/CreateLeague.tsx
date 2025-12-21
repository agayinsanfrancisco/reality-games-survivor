import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Users, DollarSign, Lock, Loader2, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CreateLeague() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [requireDonation, setRequireDonation] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationNotes, setDonationNotes] = useState('');
  const [createdLeague, setCreatedLeague] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Fetch active season
  const { data: activeSeason } = useQuery({
    queryKey: ['active-season'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Create league mutation
  const createLeague = useMutation({
    mutationFn: async () => {
      if (!currentUser || !activeSeason) throw new Error('Missing data');

      const { data, error } = await supabase
        .from('leagues')
        .insert({
          name,
          season_id: activeSeason.id,
          commissioner_id: currentUser.id,
          password_hash: password || null,
          require_donation: requireDonation,
          donation_amount: requireDonation ? parseFloat(donationAmount) : null,
          donation_notes: requireDonation ? donationNotes : null,
          max_players: 12,
          status: 'forming',
          draft_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-add creator as member
      await supabase
        .from('league_members')
        .insert({
          league_id: data.id,
          user_id: currentUser.id,
        });

      return data;
    },
    onSuccess: (data) => {
      setCreatedLeague(data);
    },
  });

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${createdLeague.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdLeague) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200 p-4 pb-24">
        <div className="max-w-md mx-auto pt-12">
          <div className="bg-white rounded-2xl shadow-elevated p-8 border border-cream-200 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-display font-bold text-neutral-800 mb-2">League Created!</h1>
            <p className="text-neutral-500 mb-6">{createdLeague.name}</p>

            <div className="bg-cream-50 rounded-xl p-4 mb-6 border border-cream-200">
              <p className="text-neutral-500 text-sm mb-2">Invite Code</p>
              <p className="text-2xl font-mono font-bold text-burgundy-500 tracking-wider">
                {createdLeague.code}
              </p>
            </div>

            <button
              onClick={copyInviteLink}
              className="w-full btn btn-primary mb-4 flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  Copy Invite Link
                </>
              )}
            </button>

            <button
              onClick={() => navigate(`/leagues/${createdLeague.id}`)}
              className="w-full btn btn-secondary"
            >
              Go to League
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all border border-cream-200"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-800">Create League</h1>
          <p className="text-neutral-500">Season {activeSeason?.number}: {activeSeason?.name}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* League Name */}
        <div className="bg-white rounded-2xl shadow-card p-6 border border-cream-200">
          <label className="block mb-4">
            <span className="text-neutral-800 font-medium flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-burgundy-500" />
              League Name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="The Tribal Council"
              className="input"
            />
          </label>

          <label className="block">
            <span className="text-neutral-800 font-medium flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-burgundy-500" />
              Password (Optional)
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank for no password"
              className="input"
            />
            <p className="text-neutral-400 text-sm mt-2">
              Anyone with the invite link can join if no password is set.
            </p>
          </label>
        </div>

        {/* Donation Settings */}
        <div className="bg-white rounded-2xl shadow-card p-6 border border-cream-200">
          <label className="flex items-center justify-between cursor-pointer mb-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-burgundy-500" />
              <div>
                <p className="text-neutral-800 font-medium">Require Donation</p>
                <p className="text-neutral-400 text-sm">Players pay to join</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={requireDonation}
              onChange={(e) => setRequireDonation(e.target.checked)}
              className="w-5 h-5 rounded bg-cream-100 border-cream-300 text-burgundy-500 focus:ring-burgundy-500"
            />
          </label>

          {requireDonation && (
            <div className="space-y-4 pt-4 border-t border-cream-200">
              <label className="block">
                <span className="text-neutral-500 text-sm mb-2 block">Amount ($)</span>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="25"
                  min="1"
                  step="1"
                  className="input"
                />
              </label>

              <label className="block">
                <span className="text-neutral-500 text-sm mb-2 block">Notes (how winnings distributed)</span>
                <textarea
                  value={donationNotes}
                  onChange={(e) => setDonationNotes(e.target.value)}
                  placeholder="Winner takes 70%, runner-up 30%"
                  rows={3}
                  className="input resize-none"
                />
              </label>
            </div>
          )}
        </div>

        {/* Create Button */}
        <button
          onClick={() => createLeague.mutate()}
          disabled={!name.trim() || createLeague.isPending || (requireDonation && !donationAmount)}
          className="w-full btn btn-primary btn-lg flex items-center justify-center gap-2"
        >
          {createLeague.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Create League'
          )}
        </button>

        {createLeague.isError && (
          <p className="text-red-500 text-center">
            Error creating league. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
