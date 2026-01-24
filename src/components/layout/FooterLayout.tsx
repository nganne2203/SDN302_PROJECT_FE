import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/constant'

const FooterLayout = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-400">PhoneAcc</h3>
            <p className="text-gray-400 mb-4">
              Cung cấp phụ kiện điện thoại chính hãng với giá tốt nhất thị trường.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span>FB</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span>IG</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span>YT</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link to={ROUTES.HOME} className="text-gray-400 hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PRODUCTS} className="text-gray-400 hover:text-white">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-gray-400 hover:text-white">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white">
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white">
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-gray-400">
              <li>123 Đường ABC, Quận 1, TP.HCM</li>
              <li>Hotline: 1900 xxxx</li>
              <li>Email: support@phoneacc.vn</li>
              <li>Giờ làm việc: 8:00 - 22:00 (T2 - CN)</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; 2026 Phone Accessories. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="#" className="text-gray-400 hover:text-white text-sm">
              Điều khoản sử dụng
            </Link>
            <Link to="#" className="text-gray-400 hover:text-white text-sm">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterLayout
