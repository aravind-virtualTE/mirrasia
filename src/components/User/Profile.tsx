import { useState } from 'react';
import { useAtom } from 'jotai';
import { authAtom, updateUserProfile } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';

export default function Profile() {
  const [auth] = useAtom(authAtom);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log("auth",auth)
  const [profile, setProfile] = useState({
    fullName: auth.user?.fullName || '',
    email: auth.user?.email || '',
    picture: auth.user?.picture || '',
    provider: auth.user?.provider || '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedProfile = await updateUserProfile({
        fullName: profile.fullName,
        // bio: profile.bio,
        // location: profile.location,
      });
      setProfile(updatedProfile);
      setEditing(false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg space-y-6 border border-gray-200">
      <div className="flex items-center space-x-6">
        {profile.picture && (
          <img
            src={profile.picture}
            alt={profile.fullName}
            className="h-24 w-24 rounded-full border-2 border-gray-300"
          />
        )}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Name : {profile.fullName}</h1>
          <p className="text-lg text-gray-600">Email : {profile.email}</p>
          <p className="text-sm text-gray-500">
            Signed in with {profile.provider}
          </p>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {editing ? (
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <Input
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <Textarea
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
            />
          </div> */}

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <Input
              value={profile.location || ''}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
          </div> */}

          <div className="flex space-x-4 pt-4">
            <Button type="submit" disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(false)}
              className="border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          {/* <div>
            <h2 className="text-lg font-medium text-gray-600">Bio</h2>
            <p className="text-gray-800">{profile.bio || 'No bio added yet'}</p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-600">Location</h2>
            <p className="text-gray-800">{profile.location || 'No location added'}</p>
          </div> */}

          <Button onClick={() => setEditing(true)} className="bg-blue-600 text-white hover:bg-blue-700">
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
}
