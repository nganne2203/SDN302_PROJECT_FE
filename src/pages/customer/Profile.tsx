import { useEffect } from 'react'
import { Avatar } from 'antd'
import { User, Mail, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useUser from '@/hooks/useUser'
import useAuth from '@/hooks/useAuth'
import { ROUTES } from '@/constants/constant'
import ButtonCommon from '@/components/common/ButtonCommon'

const Profile = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { profile, isLoading, error, fetchProfile } = useUser()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN)
      return
    }
    fetchProfile()
  }, [fetchProfile, isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <Avatar
              size={72}
              src={profile?.avatar || undefined}
              icon={<User className="w-6 h-6" />}
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                {profile?.fullName || 'Tài khoản'}
              </h1>
              <p className="text-sm text-gray-500">
                Vai trò: <span className="font-semibold">{profile?.role || '-'}</span>
              </p>
            </div>

            <ButtonCommon
              type="button"
              variant="secondary"
              onClick={() => fetchProfile()}
            >
              Tải lại
            </ButtonCommon>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4" />
                <span className="font-semibold">Email</span>
              </div>
              <p className="mt-1 text-gray-800">{profile?.email || '-'}</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <span className="font-semibold">Số điện thoại</span>
              </div>
              <p className="mt-1 text-gray-800">{profile?.phoneNumber || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

