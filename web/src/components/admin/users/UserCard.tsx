import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  MapPin,
  Heart,
  ChevronDown,
  ChevronUp,
  Edit2,
  X,
  Check,
  Loader2,
} from 'lucide-react';

type UserRole = 'player' | 'commissioner' | 'admin';

interface User {
  id: string;
  display_name: string;
  email: string;
  phone?: string | null;
  phone_verified?: boolean;
  role: UserRole;
  avatar_url?: string | null;
  hometown?: string | null;
  favorite_castaway?: string | null;
  timezone?: string | null;
  notification_email?: boolean;
  notification_sms?: boolean;
  notification_push?: boolean;
  created_at: string;
  updated_at: string;
}

interface EditForm {
  display_name: string;
  email: string;
  phone: string;
  hometown: string;
  favorite_castaway: string;
  timezone: string;
}

interface UserCardProps {
  user: User;
  leagueCount: number;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  isExpanded: boolean;
  onExpand: (id: string | null) => void;
  isEditing: boolean;
  onEdit: (user: User) => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onUpdateRole: (userId: string, role: UserRole) => void;
  editForm: EditForm;
  onEditFormChange: (data: EditForm) => void;
  isSaving: boolean;
}

// Validation helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  // Allow various phone formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

const sanitizeInput = (input: string, maxLength: number = 200): string => {
  return input.slice(0, maxLength).trim();
};

export function UserCard({
  user,
  leagueCount,
  isSelected,
  onSelect,
  isExpanded,
  onExpand,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onUpdateRole,
  editForm,
  onEditFormChange,
  isSaving,
}: UserCardProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'commissioner':
        return <ShieldCheck className="h-4 w-4 text-burgundy-500" />;
      default:
        return <Shield className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-600';
      case 'commissioner':
        return 'bg-burgundy-100 text-burgundy-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-4 border border-cream-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center border border-cream-200">
              <Users className="h-5 w-5 text-neutral-400" />
            </div>
          )}
          <div>
            <h3 className="text-neutral-800 font-medium">{user.display_name}</h3>
            <p className="text-neutral-500 text-sm">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getRoleBadgeClass(user.role)}`}
          >
            {getRoleIcon(user.role)}
            {user.role}
          </span>
          <div className="relative">
            <button
              onClick={() => onSelect(isSelected ? null : user.id)}
              className="p-1 hover:bg-cream-100 rounded"
            >
              <MoreVertical className="h-4 w-4 text-neutral-400" />
            </button>
            {isSelected && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-cream-200 rounded-xl shadow-card z-10 min-w-32">
                <button
                  onClick={() => onUpdateRole(user.id, 'player')}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-800 hover:bg-cream-50 flex items-center gap-2 rounded-t-xl"
                >
                  <Shield className="h-4 w-4" /> Set Player
                </button>
                <button
                  onClick={() => onUpdateRole(user.id, 'commissioner')}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-800 hover:bg-cream-50 flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" /> Set League Creator
                </button>
                <button
                  onClick={() => onUpdateRole(user.id, 'admin')}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-800 hover:bg-cream-50 flex items-center gap-2 rounded-b-xl"
                >
                  <ShieldAlert className="h-4 w-4" /> Set Admin
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm text-neutral-500">
        <div className="flex items-center gap-1">
          <Mail className="h-4 w-4" />
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center gap-1">
          <Phone className="h-4 w-4" />
          <span>
            {user.phone || 'No phone'}
            {user.phone_verified && <span className="text-green-500 ml-1">✓</span>}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{new Date(user.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-neutral-400 text-sm">{leagueCount} leagues</span>
        <button
          onClick={() => onExpand(isExpanded ? null : user.id)}
          className="text-burgundy-500 hover:text-burgundy-700 text-sm flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              Hide Details <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              View Full Profile <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Expanded Profile Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-cream-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-neutral-700 text-sm">Full Profile</h4>
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg flex items-center gap-1"
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  Save
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-3 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs rounded-lg flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => onEdit(user)}
                className="px-3 py-1 bg-burgundy-100 hover:bg-burgundy-200 text-burgundy-700 text-xs rounded-lg flex items-center gap-1"
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            // Edit Form
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-neutral-400 text-xs uppercase tracking-wide block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editForm.display_name}
                  onChange={(e) =>
                    onEditFormChange({
                      ...editForm,
                      display_name: sanitizeInput(e.target.value, 100),
                    })
                  }
                  className="input text-sm"
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className="text-neutral-400 text-xs uppercase tracking-wide block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    onEditFormChange({ ...editForm, email: e.target.value.toLowerCase().trim() })
                  }
                  className={`input text-sm ${editForm.email && !isValidEmail(editForm.email) ? 'border-red-300 focus:ring-red-500' : ''}`}
                  maxLength={254}
                  required
                />
                {editForm.email && !isValidEmail(editForm.email) && (
                  <p className="text-red-500 text-xs mt-1">Invalid email format</p>
                )}
              </div>
              <div>
                <label className="text-neutral-400 text-xs uppercase tracking-wide block mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    onEditFormChange({ ...editForm, phone: e.target.value.slice(0, 20) })
                  }
                  className={`input text-sm ${editForm.phone && !isValidPhone(editForm.phone) ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="+1 555-123-4567"
                  maxLength={20}
                />
                {editForm.phone && !isValidPhone(editForm.phone) && (
                  <p className="text-red-500 text-xs mt-1">Invalid phone format</p>
                )}
              </div>
              <div>
                <label className="text-neutral-400 text-xs uppercase tracking-wide block mb-1">
                  Hometown
                </label>
                <input
                  type="text"
                  value={editForm.hometown}
                  onChange={(e) =>
                    onEditFormChange({ ...editForm, hometown: sanitizeInput(e.target.value, 100) })
                  }
                  className="input text-sm"
                  placeholder="City, State"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="text-neutral-400 text-xs uppercase tracking-wide block mb-1">
                  Favorite Castaway
                </label>
                <input
                  type="text"
                  value={editForm.favorite_castaway}
                  onChange={(e) =>
                    onEditFormChange({
                      ...editForm,
                      favorite_castaway: sanitizeInput(e.target.value, 100),
                    })
                  }
                  className="input text-sm"
                  placeholder="Boston Rob, Parvati..."
                  maxLength={100}
                />
              </div>
              <div>
                <label className="text-neutral-400 text-xs uppercase tracking-wide block mb-1">
                  Timezone
                </label>
                <select
                  value={editForm.timezone}
                  onChange={(e) => onEditFormChange({ ...editForm, timezone: e.target.value })}
                  className="input text-sm"
                >
                  <option value="America/Los_Angeles">Pacific (LA)</option>
                  <option value="America/Denver">Mountain (Denver)</option>
                  <option value="America/Chicago">Central (Chicago)</option>
                  <option value="America/New_York">Eastern (NYC)</option>
                </select>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-neutral-400 text-xs uppercase tracking-wide">User ID</label>
                <p className="font-mono text-xs text-neutral-600 break-all">{user.id}</p>
              </div>
              <div>
                <label className="text-neutral-400 text-xs uppercase tracking-wide">Email</label>
                <p className="text-neutral-800">{user.email}</p>
              </div>
              <div>
                <label className="text-neutral-400 text-xs uppercase tracking-wide">Phone</label>
                <p className="text-neutral-800 flex items-center gap-1">
                  {user.phone || 'Not provided'}
                  {user.phone_verified && (
                    <span className="text-green-500 text-xs">(verified)</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-neutral-400 text-xs uppercase tracking-wide">Hometown</label>
                <p className="text-neutral-800 flex items-center gap-1">
                  {user.hometown ? (
                    <>
                      <MapPin className="h-3 w-3" /> {user.hometown}
                    </>
                  ) : (
                    <span className="text-neutral-400">Not provided</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-neutral-400 text-xs uppercase tracking-wide">
                  Favorite Castaway
                </label>
                <p className="text-neutral-800 flex items-center gap-1">
                  {user.favorite_castaway ? (
                    <>
                      <Heart className="h-3 w-3" /> {user.favorite_castaway}
                    </>
                  ) : (
                    <span className="text-neutral-400">Not provided</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-neutral-400 text-xs uppercase tracking-wide">Timezone</label>
                <p className="text-neutral-800">{user.timezone || 'America/Los_Angeles'}</p>
              </div>
              <div>
                <label className="text-neutral-400 text-xs uppercase tracking-wide">Created</label>
                <p className="text-neutral-800">{new Date(user.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-neutral-400 text-xs uppercase tracking-wide">
                  Last Updated
                </label>
                <p className="text-neutral-800">{new Date(user.updated_at).toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div
              className={`p-2 rounded-lg text-center ${user.notification_email ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-400'}`}
            >
              <Mail className="h-4 w-4 mx-auto mb-1" />
              <span className="text-xs">Email {user.notification_email ? 'ON' : 'OFF'}</span>
            </div>
            <div
              className={`p-2 rounded-lg text-center ${user.notification_sms ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-400'}`}
            >
              <Phone className="h-4 w-4 mx-auto mb-1" />
              <span className="text-xs">SMS {user.notification_sms ? 'ON' : 'OFF'}</span>
            </div>
            <div
              className={`p-2 rounded-lg text-center ${user.notification_push ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-400'}`}
            >
              <span className="text-sm mx-auto mb-1 block">🔔</span>
              <span className="text-xs">Push {user.notification_push ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
