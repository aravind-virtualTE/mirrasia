import { useEffect, useState } from 'react';
// import { useAtom } from 'jotai';
import { 
    // authAtom ,
    getUserProfile, updateUserProfile} from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProfileData {
  fullName: string;
  email: string;
  bio: string;
  location: string;
  avatar: string;
  provider: string;
}

export default function Profile() {
//   const [auth, setAuth] = useAtom(authAtom);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfile(data);
      setError(null);
    } catch (err) {
        console.log(err)
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setLoading(true);
      const updatedProfile = await updateUserProfile({
        fullName: profile.fullName,
        bio: profile.bio,
        location: profile.location,
      });
      setProfile(updatedProfile);
      setEditing(false);
      setError(null);
    } catch (err) {
        console.log(err)
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!profile) {
    return <div className="p-4">Profile not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          {profile.avatar && (
            <img
              src={profile.avatar}
              alt={profile.fullName}
              className="h-20 w-20 rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{profile.fullName}</h1>
            <p className="text-gray-500">{profile.email}</p>
            <p className="text-sm text-gray-400">
              Signed in with {profile.provider}
            </p>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <Input
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Bio
              </label>
              <Textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Location
              </label>
              <Input
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Bio</h2>
              <p>{profile.bio || 'No bio added yet'}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500">Location</h2>
              <p>{profile.location || 'No location added'}</p>
            </div>

            <Button onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}