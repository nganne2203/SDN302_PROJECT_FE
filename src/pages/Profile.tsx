import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Package,
  Settings,
  Camera,
  LogOut,
  Calendar,
  ChevronRight,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/utils/toast";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/utils/validator";

// Schema for Profile Info

const Profile = () => {
  const { user, logout } = useAuth();
  const { changePassword, isLoading, error } = useAuth();
  const [activeTab, setActiveTab] = useState<"info" | "orders" | "settings">(
    "info",
  );
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    const { confirmNewPassword, ...dataRest } = data;
    const success = await changePassword(dataRest);
    if (success) {
      console.log(success);

      toast.success("Đổi mật khẩu thành công");
    } else if (error) {
      toast.error(error);
    }
    resetPassword();
  };

  const tabs = [
    { id: "info", label: "Thông tin cá nhân", icon: User },
    { id: "orders", label: "Đơn hàng của tôi", icon: Package },
    { id: "settings", label: "Bảo mật", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Dynamic Cover Section */}
      <div className="h-48 md:h-72 bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 md:-mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden border border-slate-100">
              <div className="p-8 text-center">
                <div className="relative inline-block group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl bg-slate-100 overflow-hidden relative">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-600 bg-blue-50">
                        <User size={64} />
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-1 right-1 p-2.5 bg-white rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-blue-600 hover:scale-110 transition-all">
                    <Camera size={18} />
                  </button>
                  <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                </div>

                <div className="mt-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {user?.fullName || "Người dùng"}
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase rounded-full tracking-wider">
                      {user?.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                      <UserCheck size={14} className="text-green-500" />
                      Đã xác minh
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                  Chào mừng bạn quay trở lại. Hãy quản lý thông tin tài khoản
                  của bạn một cách an toàn nhất.
                </p>

                <div className="mt-8 pt-8 border-t border-slate-50 flex justify-around">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-800">12</p>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">
                      Đơn hàng
                    </p>
                  </div>
                  <div className="w-px h-10 bg-slate-100"></div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-800">5</p>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">
                      Đánh giá
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white border border-red-100 text-red-500 font-bold rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                >
                  <LogOut size={18} />
                  Đăng xuất tài khoản
                </button>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-500" />
                Hoạt động gần đây
              </h3>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-none w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Đăng nhập thành công
                      </p>
                      <p className="text-xs text-slate-400">
                        14:20 - 21/01/2026
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 min-h-[600px] flex flex-col">
              {/* Custom Tabs Navigation */}
              <div className="flex p-2 bg-slate-50/50 rounded-t-3xl border-b border-slate-100 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-white text-blue-600 shadow-md shadow-blue-900/5 scale-100"
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-8 flex-1">
                {activeTab === "info" && <p>Info</p>}

                {activeTab === "orders" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-8 text-left">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800">
                          Lịch sử đơn hàng
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                          Quản lý và theo dõi quá trình giao nhận hàng
                        </p>
                      </div>
                      <div className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border border-slate-100">
                        2 ĐƠN HÀNG
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="group p-5 border border-slate-100 rounded-3xl hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer"
                        >
                          <div className="flex flex-wrap justify-between items-start gap-4 mb-5 text-left">
                            <div className="flex gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                <Package size={22} />
                              </div>
                              <div className="text-left">
                                <h4 className="font-bold text-slate-800">
                                  Đơn hàng #SDN-2026-000{i}
                                </h4>
                                <div className="flex items-center gap-3 mt-1 text-slate-400 text-xs">
                                  <span className="flex items-center gap-1 font-medium italic">
                                    <Calendar size={12} /> 20/01/2026
                                  </span>
                                  <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                  <span className="font-medium italic">
                                    3 sản phẩm
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full tracking-widest bg-linear-to-r from-blue-50 to-indigo-50">
                              Đang giao
                            </span>
                          </div>

                          <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                Tổng thanh toán
                              </span>
                              <span className="text-xl font-black text-blue-600">
                                1.250.000 ₫
                              </span>
                            </div>
                            <button className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:gap-3 transition-all">
                              Chi tiết đơn hàng <ChevronRight size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button className="w-full mt-8 py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/20 transition-all">
                      Xem tất cả lịch sử mua hàng
                    </button>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-10 text-left">
                      <h3 className="text-2xl font-bold text-slate-800">
                        Cài đặt bảo mật
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">
                        Nâng cao tính bảo mật cho tài khoản của bạn
                      </p>
                    </div>

                    {/* Change Password Section */}
                    <div
                      className={`bg-white border text-left rounded-3xl transition-all duration-500 overflow-hidden ${
                        isChangingPassword
                          ? "border-blue-200 ring-4 ring-blue-500/5"
                          : "border-slate-100"
                      }`}
                    >
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                            <Lock size={22} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              Đổi mật khẩu
                            </p>
                            <p className="text-slate-400 text-xs">
                              Cập nhật mật khẩu định kỳ 3 - 6 tháng
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setIsChangingPassword(!isChangingPassword)
                          }
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            isChangingPassword
                              ? "text-slate-500 hover:bg-slate-50"
                              : "text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          {isChangingPassword ? "Hủy bỏ" : "Cập nhật"}
                        </button>
                      </div>

                      {isChangingPassword && (
                        <div className="px-8 pb-8 pt-4 border-t border-slate-50 animate-in fade-in duration-500">
                          <form
                            onSubmit={handleSubmitPassword(onPasswordSubmit)}
                            className="space-y-6"
                          >
                            {/* Current Password */}
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">
                                Mật khẩu hiện tại
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <Lock size={18} className="text-slate-400" />
                                </div>
                                <input
                                  type={
                                    showCurrentPassword ? "text" : "password"
                                  }
                                  {...registerPassword("currentPassword")}
                                  className={`w-full pl-11 pr-12 py-3.5 rounded-2xl border transition-all outline-hidden bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                                    passwordErrors.currentPassword
                                      ? "border-red-400"
                                      : ""
                                  }`}
                                  placeholder="••••••••"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowCurrentPassword(!showCurrentPassword)
                                  }
                                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff size={18} />
                                  ) : (
                                    <Eye size={18} />
                                  )}
                                </button>
                              </div>
                              {passwordErrors.currentPassword && (
                                <p className="mt-2 text-xs text-red-500 font-medium">
                                  {passwordErrors.currentPassword.message}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* New Password */}
                              <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                  Mật khẩu mới
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock
                                      size={18}
                                      className="text-slate-400"
                                    />
                                  </div>
                                  <input
                                    type={showNewPassword ? "text" : "password"}
                                    {...registerPassword("newPassword")}
                                    className={`w-full pl-11 pr-12 py-3.5 rounded-2xl border transition-all outline-hidden bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                                      passwordErrors.newPassword
                                        ? "border-red-400"
                                        : ""
                                    }`}
                                    placeholder="••••••••"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowNewPassword(!showNewPassword)
                                    }
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                  >
                                    {showNewPassword ? (
                                      <EyeOff size={18} />
                                    ) : (
                                      <Eye size={18} />
                                    )}
                                  </button>
                                </div>
                                {passwordErrors.newPassword && (
                                  <p className="mt-2 text-xs text-red-500 font-medium">
                                    {passwordErrors.newPassword.message}
                                  </p>
                                )}
                              </div>

                              {/* Confirm New Password */}
                              <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                  Xác nhận mật khẩu
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock
                                      size={18}
                                      className="text-slate-400"
                                    />
                                  </div>
                                  <input
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    {...registerPassword("confirmNewPassword")}
                                    className={`w-full pl-11 pr-12 py-3.5 rounded-2xl border transition-all outline-hidden bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                                      passwordErrors.confirmNewPassword
                                        ? "border-red-400"
                                        : ""
                                    }`}
                                    placeholder="••••••••"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword,
                                      )
                                    }
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOff size={18} />
                                    ) : (
                                      <Eye size={18} />
                                    )}
                                  </button>
                                </div>
                                {passwordErrors.confirmNewPassword && (
                                  <p className="mt-2 text-xs text-red-500 font-medium">
                                    {passwordErrors.confirmNewPassword.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="pt-4">
                              <button
                                type="submit"
                                className="w-full md:w-auto px-10 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all active:scale-95"
                              >
                                Xác nhận đổi mật khẩu
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>

                    {/* Danger Zone */}
                    <div className="mt-12 text-left">
                      <h4 className="flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-xs mb-4">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        Vùng nguy hiểm
                      </h4>
                      <div className="bg-red-50/50 border border-red-100 rounded-3xl p-6 flex flex-wrap justify-between items-center gap-4">
                        <div>
                          <p className="font-bold text-slate-800">
                            Xóa vĩnh viễn tài khoản
                          </p>
                          <p className="text-slate-500 text-xs mt-0.5">
                            Một khi đã xóa, dữ liệu sẽ không thể phục hồi lại
                            được.
                          </p>
                        </div>
                        <button className="px-6 py-2.5 bg-white border-2 border-red-100 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-all">
                          Yêu cầu xóa
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Profile;
