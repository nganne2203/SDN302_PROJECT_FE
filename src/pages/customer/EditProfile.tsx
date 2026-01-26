import { useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, Card, Divider, Upload } from "antd";
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Camera,
  Phone,
  Mail,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FieldCustom from "@/components/common/FieldCustom";
import ButtonCommon from "@/components/common/ButtonCommon";
import { ROUTES } from "@/constants/constant";
import useUser from "@/hooks/useUser";
import useAuth from "@/hooks/useAuth";
import { userProfileSchema, type ProfileFormData } from "@/utils/validator";
import toast from "@/utils/toast";

const EditProfile = () => {
  const navigate = useNavigate();
  //   const [avatarUrl, setAvatarUrl] = useState<string>(MOCK_DATA.avatar);
  const { isAuthenticated } = useAuth();

  const { control, handleSubmit, setValue, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(userProfileSchema),
  });

  const { profile, addresses, updateProfile, isLoading, error } = useUser();

  console.log(profile, addresses);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (profile) {
      reset({ ...profile, addresses });
    }
  }, [isAuthenticated, navigate, profile, addresses, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  const onSubmit = useCallback(
    async (data: ProfileFormData) => {
      const result = await updateProfile(data);

      if (result) {
        navigate(ROUTES.PROFILE);
        toast.success("Cập nhật thông tin thành công");
      } else {
        toast.error("Cập nhật thông tin thất bại");
      }
      console.log(result);
      console.log(data);
    },
    [updateProfile, navigate],
  );

  //   const handleAvatarChange = (info: any) => {
  //     // Ant Design Upload triggers change on every status update
  //     // We only care if there's a file selected (even if upload failed or wasn't sent)
  //     if (info.file.originFileObj) {
  //       const url = URL.createObjectURL(info.file.originFileObj);
  //       setAvatarUrl(url);
  //       setValue("avatar", url, {
  //         shouldDirty: true,
  //         shouldTouch: true,
  //         shouldValidate: true,
  //       });
  //     } else if (
  //       info.fileList &&
  //       info.fileList.length > 0 &&
  //       info.fileList[0].originFileObj
  //     ) {
  //       // Fallback for some scenarios where file might be in fileList
  //       const url = URL.createObjectURL(info.fileList[0].originFileObj);
  //       setAvatarUrl(url);
  //       setValue("avatar", url, {
  //         shouldDirty: true,
  //         shouldTouch: true,
  //         shouldValidate: true,
  //       });
  //     }
  //   };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={ROUTES.PROFILE}>
              <ButtonCommon variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </ButtonCommon>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa hồ sơ
              </h1>
              <p className="text-sm text-gray-500">
                Quản lý thông tin cá nhân và địa chỉ nhận hàng
              </p>
            </div>
          </div>
          <ButtonCommon
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
            icon={<Save className="w-4 h-4" />}
          >
            Lưu thay đổi
          </ButtonCommon>
        </div>
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Info & Avatar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm rounded-xl border-gray-200">
              <div className="flex flex-col items-center pb-6">
                <Upload
                  name="avatar"
                  listType="picture-circle"
                  showUploadList={false}
                  className="avatar-uploader"
                  beforeUpload={() => false}
                  //   onChange={handleAvatarChange}
                >
                  <div className="relative group cursor-pointer">
                    <Avatar
                      size={120}
                      //   src={avatarUrl}
                      icon={<User className="w-16 h-16 text-gray-400" />}
                      className="border-4 border-white shadow-md transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </Upload>
                <p className="mt-4 text-sm font-medium text-gray-500">
                  Ảnh đại diện
                </p>
              </div>

              <Divider className="my-4" />

              <div className="space-y-4">
                <FieldCustom.Controlled
                  name="fullname"
                  control={control}
                  render={({ value, onChange, error }) => (
                    <FieldCustom.Input
                      label="Họ và tên"
                      value={value as string}
                      onChange={onChange}
                      error={error}
                      prefix={<User className="w-4 h-4 text-gray-400 mr-2" />}
                    />
                  )}
                />

                <FieldCustom.Controlled
                  name="email"
                  control={control}
                  render={({ value, onChange, error }) => (
                    <FieldCustom.Input
                      label="Email"
                      type="email"
                      value={value as string}
                      onChange={onChange}
                      error={error}
                      disabled
                      prefix={<Mail className="w-4 h-4 text-gray-400 mr-2" />}
                    />
                  )}
                />

                <FieldCustom.Controlled
                  name="phone"
                  control={control}
                  render={({ value, onChange, error }) => (
                    <FieldCustom.Input
                      label="Số điện thoại"
                      value={value as string}
                      onChange={onChange}
                      error={error}
                      prefix={<Phone className="w-4 h-4 text-gray-400 mr-2" />}
                    />
                  )}
                />
              </div>
            </Card>
          </div>
          {/* Right Column: Addresses */}
          <div className="lg:col-span-2">
            <Card
              className="shadow-sm rounded-xl border-gray-200 h-full"
              bordered={false}
              title={
                <span className="text-lg font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Sổ địa chỉ
                </span>
              }
              extra={
                <ButtonCommon
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() =>
                    append({
                      fullname: "",
                      phone: "",
                      addressLine: "",
                      city: "",
                      district: "",
                      ward: "",
                      isDefault: false,
                    })
                  }
                >
                  Thêm địa chỉ
                </ButtonCommon>
              }
            >
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative p-6 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-300"
                  >
                    <div className="absolute right-4 top-4 flex items-center gap-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                        {index + 1}
                      </span>
                      <h3 className="font-semibold text-gray-800">
                        Địa chỉ {index + 1}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FieldCustom.Controlled
                        name={`addresses.${index}.fullname`}
                        control={control}
                        render={({ value, onChange, error }) => (
                          <FieldCustom.Input
                            placeholder="Người nhận"
                            value={value as string}
                            onChange={onChange}
                            error={error}
                            className="mb-0"
                          />
                        )}
                      />

                      <FieldCustom.Controlled
                        name={`addresses.${index}.phone`}
                        control={control}
                        render={({ value, onChange, error }) => (
                          <FieldCustom.Input
                            placeholder="Số điện thoại"
                            value={value as string}
                            onChange={onChange}
                            error={error}
                            className="mb-0"
                          />
                        )}
                      />

                      <div className="md:col-span-2">
                        <FieldCustom.Controlled
                          name={`addresses.${index}.addressLine`}
                          control={control}
                          render={({ value, onChange, error }) => (
                            <FieldCustom.Input
                              placeholder="Số nhà, tên đường"
                              value={value as string}
                              onChange={onChange}
                              error={error}
                              className="mb-0"
                            />
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 md:col-span-2">
                        <FieldCustom.Controlled
                          name={`addresses.${index}.city`}
                          control={control}
                          render={({ value, onChange, error }) => (
                            <FieldCustom.Input
                              placeholder="Tỉnh/Thành phố"
                              value={value as string}
                              onChange={onChange}
                              error={error}
                              className="mb-0"
                            />
                          )}
                        />
                        <FieldCustom.Controlled
                          name={`addresses.${index}.district`}
                          control={control}
                          render={({ value, onChange, error }) => (
                            <FieldCustom.Input
                              placeholder="Quận/Huyện"
                              value={value as string}
                              onChange={onChange}
                              error={error}
                              className="mb-0"
                            />
                          )}
                        />
                        <FieldCustom.Controlled
                          name={`addresses.${index}.ward`}
                          control={control}
                          render={({ value, onChange, error }) => (
                            <FieldCustom.Input
                              placeholder="Phường/Xã"
                              value={value as string}
                              onChange={onChange}
                              error={error}
                              className="mb-0"
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <FieldCustom.Controlled
                        name={`addresses.${index}.isDefault`}
                        control={control}
                        render={({ value, onChange }) => (
                          <div className="flex items-center gap-2">
                            <FieldCustom.Checkbox
                              checked={
                                fields.length === 1 ? true : (value as boolean)
                              }
                              disabled={fields.length === 1}
                              onChange={(checked) => {
                                if (checked) {
                                  fields.forEach((_, idx) => {
                                    if (idx !== index) {
                                      setValue(
                                        `addresses.${idx}.isDefault`,
                                        false,
                                      );
                                    }
                                  });
                                }
                                onChange(checked);
                              }}
                              label="Đặt làm địa chỉ mặc định"
                              className="mb-0"
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>
                ))}

                {fields.length > 0 && (
                  <ButtonCommon
                    type="button"
                    variant="primary"
                    className="w-full border-dashed"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() =>
                      append({
                        fullname: "",
                        phone: "",
                        addressLine: "",
                        city: "",
                        district: "",
                        ward: "",
                        isDefault: false,
                      })
                    }
                  >
                    Thêm địa chỉ mới
                  </ButtonCommon>
                )}

                {fields.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Chưa có địa chỉ nào</p>
                    <ButtonCommon
                      variant="ghost"
                      className="mt-2"
                      onClick={() =>
                        append({
                          fullname: "",
                          phone: "",
                          addressLine: "",
                          city: "",
                          district: "",
                          ward: "",
                          isDefault: true,
                        })
                      }
                    >
                      Thêm ngay
                    </ButtonCommon>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
