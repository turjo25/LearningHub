import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-r from-gray-900 to-gray-800 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">LMS</span>
              </div>
              <h3 className="text-xl font-bold text-white">Learning Hub</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering learners worldwide with accessible, high-quality
              education from expert instructors.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/courses"
                  className="text-gray-400 hover:text-white transition duration-200"
                >
                  Browse Courses
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition duration-200"
                >
                  Become a Teacher
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition duration-200"
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition duration-200"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition duration-200"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition duration-200"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition duration-200"
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">
              Get in Touch
            </h4>
            <div className="space-y-3">
              <div className="text-gray-400 text-sm">
                <p className="font-medium text-gray-300 mb-1">Email</p>
                <a
                  href="mailto:support@learninghub.com"
                  className="hover:text-white transition duration-200"
                >
                  support@learninghub.com
                </a>
              </div>
              <div className="text-gray-400 text-sm">
                <p className="font-medium text-gray-300 mb-1">Phone</p>
                <a
                  href="tel:+1234567890"
                  className="hover:text-white transition duration-200"
                >
                  +880 123 456 7890
                </a>
              </div>
              <div className="text-gray-400 text-sm">
                <p className="font-medium text-gray-300 mb-1">Location</p>
                <p>Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Social Media & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Social Links */}
          <div className="flex space-x-6 mb-6 md:mb-0">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition duration-200 text-2xl"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition duration-200 text-2xl"
              aria-label="Twitter"
            >
              𝕏
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition duration-200 text-2xl"
              aria-label="LinkedIn"
            >
              in
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition duration-200 text-2xl"
              aria-label="Instagram"
            >
              📷
            </a>
          </div>

          {/* Copyright & Links */}
          <div className="text-center md:text-right text-gray-400 text-sm space-y-2">
            <p>&copy; {currentYear} Learning Hub. All rights reserved.</p>
            <div className="flex justify-center md:justify-end space-x-6">
              <a href="#" className="hover:text-white transition duration-200">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition duration-200">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition duration-200">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
