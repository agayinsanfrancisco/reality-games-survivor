import { useNavigate } from 'react-router-dom';
import {
  X,
  Check,
  Copy,
  MessageCircle,
  Mail,
  Twitter,
  Facebook,
} from 'lucide-react';
import { useState } from 'react';

interface ShareLeagueModalProps {
  league: {
    id: string;
    name: string;
    code: string;
  };
  joinCode: string;
  isPrivate: boolean;
  onClose: () => void;
}

export function ShareLeagueModal({
  league,
  joinCode,
  isPrivate,
  onClose,
}: ShareLeagueModalProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const getInviteLink = () => {
    return `${window.location.origin}/join/${league.code}`;
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaTwitter = () => {
    const text = `Join my Survivor Fantasy League "${league.name}"! 🏝️🔥`;
    const url = getInviteLink();
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareViaFacebook = () => {
    const url = getInviteLink();
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareViaSMS = () => {
    const text = `Join my Survivor Fantasy League! ${getInviteLink()}`;
    window.open(`sms:?body=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Join my Survivor Fantasy League: ${league.name}`;
    const body = `Hey!\n\nI created a Survivor Fantasy League and want you to join!\n\nLeague: ${league.name}\nJoin here: ${getInviteLink()}\n\nLet's see who can outwit, outplay, and outlast! 🏝️`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_blank'
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-elevated max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-neutral-800">Share Your League</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="font-semibold text-neutral-800">{league.name}</h3>
          <p className="text-neutral-500 text-sm">League created successfully!</p>
        </div>

        <div className="bg-cream-50 rounded-xl p-4 mb-6 border border-cream-200">
          <p className="text-neutral-500 text-xs mb-1 text-center">Invite Code</p>
          <p className="text-2xl font-mono font-bold text-burgundy-500 tracking-wider text-center">
            {league.code}
          </p>
          {isPrivate && joinCode && (
            <p className="text-neutral-400 text-xs mt-2 text-center">
              Join Password: <span className="font-mono">{joinCode}</span>
            </p>
          )}
        </div>

        <button
          onClick={copyInviteLink}
          className="w-full btn btn-primary mb-4 flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="h-5 w-5" />
              Link Copied!
            </>
          ) : (
            <>
              <Copy className="h-5 w-5" />
              Copy Invite Link
            </>
          )}
        </button>

        <p className="text-neutral-500 text-sm text-center mb-3">Or share via:</p>
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={shareViaSMS}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
          >
            <MessageCircle className="h-6 w-6 text-green-600" />
            <span className="text-xs text-neutral-600">SMS</span>
          </button>
          <button
            onClick={shareViaEmail}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <Mail className="h-6 w-6 text-blue-600" />
            <span className="text-xs text-neutral-600">Email</span>
          </button>
          <button
            onClick={shareViaTwitter}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors"
          >
            <Twitter className="h-6 w-6 text-sky-500" />
            <span className="text-xs text-neutral-600">Twitter</span>
          </button>
          <button
            onClick={shareViaFacebook}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <Facebook className="h-6 w-6 text-indigo-600" />
            <span className="text-xs text-neutral-600">Facebook</span>
          </button>
        </div>

        <button
          onClick={() => {
            onClose();
            navigate(`/leagues/${league.id}`);
          }}
          className="w-full btn btn-secondary mt-4"
        >
          Go to League
        </button>
      </div>
    </div>
  );
}
