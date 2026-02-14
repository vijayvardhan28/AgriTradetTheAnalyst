import React from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Building2, Mail } from 'lucide-react';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
  // Carousel images data
  const carouselImages = [
    {
      id: 1,
      src: "https://resize.indiatvnews.com/en/resize/newbucket/1200_-/2022/02/pti02-05-2022-000235b-1644084667.jpg",
      alt: "Farm landscape",
      caption: ""
    },
    {
      id: 2,
      src: "https://media.istockphoto.com/id/1496400818/photo/happy-smiling-indian-farmer-counting-money-or-currency-at-greenhouse-concept-of-profit.jpg?s=612x612&w=0&k=20&c=LKPkFyXKLKuO5SJTlgrfxNeYbNqhXZ7Wct6IQqoneHk=",
      alt: "Harvesting crops",
      caption: ""
    },
    {
      id: 3,
      src: "https://thumbs.dreamstime.com/b/happy-village-farmer-greeting-banker-hand-shake-showing-paddy-field-concept-financial-support-service-agriculture-274779015.jpg",
      alt: "Agricultural technology",
      caption: ""
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}


      {/* Image Carousel */}
      <div className="container mx-auto px-4 py-8">
        <Carousel fade interval={3000} pause={false}>
          {carouselImages.map((image) => (
            <Carousel.Item key={image.id}>
              <img
                className="d-block w-100 rounded-lg shadow-lg"
                src={image.src}
                alt={image.alt}
                style={{ maxHeight: '500px', objectFit: 'cover' }}
              />
              <Carousel.Caption className="bg-black bg-opacity-50 rounded p-3">
                <h3 className="text-2xl font-bold">{image.caption}</h3>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
            Everything you need to manage your agricultural business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/finance" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <LineChart className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Finance Tracker</h3>
              <p className="text-gray-600">Track your agricultural finances and calculate profits</p>
            </div>
          </Link>

          <Link to="/disease-detector" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Disease Detector</h3>
              <p className="text-gray-600">Upload crop photos to detect diseases using AI</p>
            </div>
          </Link>

          <Link to="/agribot" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">AgriBot Assistant</h3>
              <p className="text-gray-600">Chat with our AI assistant for farming advice</p>
            </div>
          </Link>

          <Link to="/forecast" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Price Forecast</h3>
              <p className="text-gray-600">Get 30-day price predictions for your crops</p>
            </div>
          </Link>

          <Link to="/schemes" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Government Schemes</h3>
              <p className="text-gray-600">Access and apply for government agricultural schemes</p>
            </div>
          </Link>

          <Link to="/contact" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Contact Us</h3>
              <p className="text-gray-600">Get in touch with our support team for assistance</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Guides</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Newsletter</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">About Us</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Our Story</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Team</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Twitter</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Facebook</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;