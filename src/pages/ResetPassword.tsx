import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Input, Button, Steps, ConfigProvider, Typography } from "antd";
import { Mail, Key, Lock, RotateCcw, CheckCircle } from "lucide-react";
import toast from "@/utils/toast";
import useAuth from "@/hooks/useAuth";
import {
  confirmResetPasswordSchema,
  resetPasswordSchema,
  verifyOTPResetPasswordSchema,
  type ConfirmResetPasswordFormData,
  type ResetPasswordFormData,
  type VerifyOTPResetPasswordFormData,
} from "@/utils/validator";
import { VERIFY_TYPE } from "@/constants/constant";

const { Title } = Typography;

const Step1EmailForm = ({
  onSuccess,
}: {
  onSuccess: (email: string) => void;
}) => {
  const { resetPassword, isLoading, error } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    const success = await resetPassword(data.email);
    if (success) {
      toast.success("Vui lòng kiểm tra gmail để lấy mã OTP");
      onSuccess(data.email);
    } else if (error) {
      toast.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in-up">
      <Form.Item
        label=""
        validateStatus={errors.email ? "error" : ""}
        help={errors.email?.message}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              prefix={<Mail className="w-4 h-4 text-slate-400 mr-2" />}
              placeholder="Vui lòng nhập email đã đăng ký để tiến hành lấy lại mật khẩu"
              status={errors.email ? "error" : ""}
            />
          )}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={isLoading} block>
        Gửi mã xác thực
      </Button>
    </form>
  );
};

const Step2OtpForm = ({
  onSuccess,
  onBack,
  email,
}: {
  onSuccess: (step: number) => void;
  onBack: (step: number) => void;
  email: string;
}) => {
  const { verifyOTP, isLoading, error } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOTPResetPasswordFormData>({
    resolver: zodResolver(verifyOTPResetPasswordSchema),
  });

  const onSubmit = async (data: VerifyOTPResetPasswordFormData) => {
    const restData = {
      ...data,
      email: email,
      type: VERIFY_TYPE.RESET_PASSWORD,
    };
    const success = await verifyOTP(restData);
    if (success) {
      toast.success("Đổi mật khẩu thành công");
      onSuccess(2);
    } else if (error) {
      toast.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="animate-fade-in-up flex flex-col items-center"
    >
      <Form.Item className="w-full text-center">
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <Input.OTP
              length={6}
              {...field}
              size="large"
              style={{ gap: "8px" }}
              status={errors.code ? "error" : ""}
              disabled={isLoading}
            />
          )}
        />
      </Form.Item>

      <div className="flex w-full gap-3 mt-4">
        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          className="flex-1"
        >
          Xác nhận
        </Button>
      </div>
    </form>
  );
};

const Step3PasswordForm = ({ email }: { email: string }) => {
  const { confirmResetPassword, isLoading, error } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmResetPasswordFormData>({
    resolver: zodResolver(confirmResetPasswordSchema),
  });

  const onSubmit = async (data: ConfirmResetPasswordFormData) => {
    const success = await confirmResetPassword({
      email: email,
      ...data,
    });
    if (success) {
      toast.success("Đổi mật khẩu thành công");
    } else if (error) {
      toast.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in-up">
      <Form.Item label="Tài khoản">
        <Input
          value={email}
          prefix={<CheckCircle className="w-4 h-4 text-green-500 mr-2" />}
          readOnly
          className="bg-slate-50 text-slate-500"
        />
      </Form.Item>

      <Form.Item
        label="Mật khẩu mới"
        validateStatus={errors.password ? "error" : ""}
        help={errors.password?.message}
      >
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input.Password
              {...field}
              prefix={<Lock className="w-4 h-4 text-slate-400 mr-2" />}
              placeholder="••••••••"
              disabled={isLoading}
            />
          )}
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        loading={isLoading}
        block
        className="mt-2 h-12 font-semibold"
      >
        Đổi mật khẩu
      </Button>
    </form>
  );
};

const ResetPassword = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [sharedData, setSharedData] = useState({
    email: "",
  });
  const stepsItems = [
    { title: "Email", icon: <Mail className="w-5 h-5" /> },
    { title: "OTP", icon: <Key className="w-5 h-5" /> },
    { title: "Đổi mật khẩu", icon: <Lock className="w-5 h-5" /> },
  ];

  const handleStep1Success = (email: string) => {
    setSharedData((prev) => ({ ...prev, email }));
    setCurrentStep(1);
  };

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: "#2563eb", borderRadius: 8 },
        components: {
          Input: { controlHeight: 45 },
          Button: { controlHeight: 45 },
        },
      }}
    >
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <Title level={3} style={{ margin: 0 }}>
              Khôi phục mật khẩu
            </Title>
          </div>

          <Steps
            current={currentStep}
            items={stepsItems}
            className="custom-steps mb-8"
          />

          <div className="mt-6">
            {currentStep === 0 && (
              <Step1EmailForm onSuccess={handleStep1Success} />
            )}

            {currentStep === 1 && (
              <Step2OtpForm
                onSuccess={setCurrentStep}
                email={sharedData.email}
                onBack={() => setCurrentStep(0)}
              />
            )}

            {currentStep === 2 && (
              <Step3PasswordForm email={sharedData.email} />
            )}
          </div>
        </div>
      </div>
      <style>{`
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .ant-otp-input { border-radius: 8px !important; height: 50px !important; border-color: #e2e8f0 !important; }
        .ant-otp-input:focus { border-color: #2563eb !important; }
      `}</style>
    </ConfigProvider>
  );
};

export default ResetPassword;
