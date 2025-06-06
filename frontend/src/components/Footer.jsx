import React from "react";
import { Link } from "react-router-dom";
import schoolLogo from "../assets/logo.png";
import { FaSquareFacebook } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaLocationDot, FaPhone, FaEnvelope } from "react-icons/fa6";


const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="col-span-1 ">
            <div className="flex items-center space-x-4">
              <img
                src={schoolLogo}
                alt="Mahiyangana National College"
                className="h-12 w-auto"
              />
              <div>
                <h3 className="text-lg font-bold">
                  Mahiyangana National School
                </h3>
              </div>
            </div>
            <p className="mt-4 text-gray-400 text-sm">
              Providing quality education and fostering academic excellence
              since establishment. Our mission is to nurture well-rounded
              individuals prepared for future challenges.
            </p>
          </div>

          {/* Quick Links */}
          <div className="pl-0 md:pl-20">
            <h3 className="text-md font-bold text-white uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-1">
              <li>
                <Link
                  to="/"
                  className="text-base text-gray-400 hover:text-white"
                >
                  Admin
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-base text-gray-400 hover:text-white"
                >
                  Staff
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-base text-gray-400 hover:text-white"
                >
                  Student
                </Link>
              </li>
            </ul>
          </div>

          <div className="pl-0 md:pl-15">
            <h3 className="text-md font-bold text-white uppercase tracking-wider">
              Follow Us
            </h3>
            <ul className="mt-4 space-y-1">
              <li>
                <Link
                  to="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base flex  text-gray-400 hover:text-white"
                >
                  <FaSquareFacebook className="mr-2 mt-1" />
                  Facebook
                </Link>
              </li>
              <li>
                <Link
                  to="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base flex text-gray-400 hover:text-white"
                >
                  <FaInstagram className="mr-2 mt-1" />
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  to="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base flex text-gray-400 hover:text-white"
                >
                  <FaLinkedin className="mr-2 mt-1" />
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link
                  to="https://www.twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base flex text-gray-400 hover:text-white"
                >
                  <FaYoutube className="mr-2 mt-[5px]" />
                  Youtube
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-md font-bold text-white uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-2 text-gray-400">
              <li className="flex items-start">
                <FaLocationDot className="mr-2 mt-1.5" />
                <span>Mahiyangana National School,<br />Mahiyangana, Badulla</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-2" />
                <span>+94 21 222 2978</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-2" />
                <span>mahiyanganaschool@admin.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-center text-base text-gray-400">
            &#169; {new Date().getFullYear()} Mahiyangana National College. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
