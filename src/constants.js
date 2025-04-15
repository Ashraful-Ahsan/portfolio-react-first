// Skills Section Logo's
import htmlLogo from './assets/tech_logo/html.png';
import cssLogo from './assets/tech_logo/css.png';
import sassLogo from './assets/tech_logo/sass.png';
import javascriptLogo from './assets/tech_logo/javascript.png';
import reactjsLogo from './assets/tech_logo/reactjs.png';
import daisyUI from "./assets/tech_logo/daisyui.svg";


import tailwindcssLogo from './assets/tech_logo/tailwindcss.png';

import materialuiLogo from './assets/tech_logo/materialui.png';
import bootstrapLogo from './assets/tech_logo/bootstrap.png';

import nodejsLogo from './assets/tech_logo/nodejs.png';
import expressjsLogo from './assets/tech_logo/express.png';
import mysqlLogo from './assets/tech_logo/mysql.png';
import mongodbLogo from './assets/tech_logo/mongodb.png';
import firebaseLogo from './assets/tech_logo/firebase.png';
import cLogo from './assets/tech_logo/c.png';
import cppLogo from './assets/tech_logo/cpp.png';
import php from './assets/tech_logo/php.png';
import pythonLogo from './assets/tech_logo/python.png';
import gitLogo from './assets/tech_logo/git.png';
import githubLogo from './assets/tech_logo/github.png';
import vscodeLogo from './assets/tech_logo/vscode.png';
import postmanLogo from './assets/tech_logo/postman.png';
import mcLogo from './assets/tech_logo/mc.png';
import figmaLogo from './assets/tech_logo/figma.png';
import netlifyLogo from './assets/tech_logo/netlify.png';
import vercelLogo from './assets/tech_logo/vercel.png';
import laravel from './assets/tech_logo/laravel2.png';
import phpstrom from "./assets/tech_logo/phpstrompng.png";

// Experience Section Logo's
import webverseLogo from "./assets/services_logo/figmatohtml.webp";
import agcLogo from "./assets/services_logo/laravel3.webp";
import newtonschoolLogo from "./assets/services_logo/reactjs.svg";

// Education Section Logo's
import glaLogo from "./assets/education_logo/nu.png";
import bsaLogo from "./assets/education_logo/college-logo.jpeg";
import vpsLogo from './assets/education_logo/school-logo.jpg';
import primary from "./assets/education_logo/primary.png";
// Project Section Logo's
import githubdetLogo from "./assets/work_logo/ecommerce-project.PNG";



export const SkillsInfo = [
  {
    title: "Frontend",
    skills: [
      { name: "HTML", logo: htmlLogo },
      { name: "CSS", logo: cssLogo },
      { name: "SASS", logo: sassLogo },
      { name: "JavaScript", logo: javascriptLogo },
      { name: "React JS", logo: reactjsLogo },

      { name: "Tailwind CSS", logo: tailwindcssLogo },

      { name: "Material UI", logo: materialuiLogo },
      { name: "Bootstrap", logo: bootstrapLogo },
      { name: "Daisy UI", logo: daisyUI },
    ],
  },
  {
    title: "Backend",
    skills: [
      { name: "Laravel", logo: laravel },
      { name: "MySQL", logo: mysqlLogo },
      { name: "Node JS", logo: nodejsLogo },
      { name: "Express JS", logo: expressjsLogo },

      { name: "MongoDB", logo: mongodbLogo },
      { name: "Firebase", logo: firebaseLogo },
    ],
  },
  {
    title: "Languages",
    skills: [
      { name: "JavaScript", logo: javascriptLogo },
      { name: "PHP", logo: php },
      { name: "C", logo: cLogo },
      { name: "C++", logo: cppLogo },
      
      { name: "Python", logo: pythonLogo },
      

      
    ],
  },
  {
    title: "Tools",
    skills: [
      { name: "Git", logo: gitLogo },
      { name: "GitHub", logo: githubLogo },
      { name: "VS Code", logo: vscodeLogo },
      { name: "PHPStorm", logo: phpstrom }, 
      { name: "Postman", logo: postmanLogo },
      { name: "Compass", logo: mcLogo },
      { name: "Vercel", logo: vercelLogo },
      { name: "Netlify", logo: netlifyLogo },
      { name: "Figma", logo: figmaLogo },
    ],
  },
];

  export const experiences = [
    {
      id: 0,
      img: webverseLogo,
      role: "Figma/PSD to HTML, CSS, JS",
      desc: "I offer professional website development services where I expertly convert your Figma or PSD designs into clean, responsive, and interactive websites using HTML, CSS, and JavaScript. Every project I work on is built with pixel-perfect accuracy, ensuring your designs look flawless on all devices and browsers. I focus on clean code, optimized performance, and modern design practices to deliver a smooth and engaging user experience that truly represents your brand or business online.",
      skills: [
        "HTML",
        "CSS",
        "JavaScript",
        "Figma",
        "Tailwind CSS",
        "Bootstrap",
        "Daisy UI",
      ],
    },
    {
      id: 1,
      img: agcLogo,
      role: "API Development (PHP&Laravel)",
      desc: "With strong expertise in PHP Laravel, I develop powerful, scalable, and secure APIs tailored to meet the specific needs of your web or application projects. Whether it’s a backend for a website, a mobile app, or third-party integration, I ensure the API architecture is efficient, maintainable, and designed for high performance. From authentication systems to complex data operations, my API solutions are built to handle dynamic business requirements and support seamless communication between systems.",
      skills: [
        "PHP",
        "Laravel",
        "MySQL",
        "Postman",
        "Git",
        "GitHub",
        "VS Code",
      ],
    },
    {
      id: 2,
      img: newtonschoolLogo,
      role: "SPA Development (ReactJS)",
      desc: "I build dynamic, modern single-page applications (SPAs) using React, designed to offer fast, smooth, and interactive web experiences. My SPAs are fully responsive and built to handle real-time updates, rich user interfaces, and intuitive navigation — all within a single page without full reloads. By combining React’s powerful component-based structure with clean coding standards, I create applications that are scalable, maintainable, and tailored for optimal user satisfaction.",
      skills: [

        "Javascript",
        "React JS",
        "Node JS",
        "Express JS",
        "MongoDB",
        "Tailwind CSS",
        "Bootstrap",
        "Daisy UI",
        "Material UI",

      ],
    },
  ];
  
  export const education = [
    {
      id: 0,
      img: glaLogo,
      school: "National University, Bangladesh",
      date: "2021 - Currently",
      grade: "4.72 (avg)",
      desc: "I am currently pursuing my BSc (Hons) in Computer Science and Engineering (CSE) at National University, Bangladesh. I am passionate about full-stack web development, specializing in technologies such as PHP Laravel, JavaScript, HTML, CSS, and JS. Additionally, I have learned programming languages like C, C++, and Python, with a focus on Object-Oriented Programming (OOP). I am also gaining experience in database management using MySQL and other related technologies. Throughout my studies, I continue to develop my skills in web development and aim to build dynamic applications with a strong technical foundation.",
      degree: "BSc (Hons) in Computer Science and Engineering (CSE)",
    },
    {
      id: 1,
      img: bsaLogo,
      school: "Islamia Government College, Sirajganj",
      date: "2016-2018",
      grade: "4.17/5",
      desc: "I completed my Higher Secondary School Certificate (HSC) in Science from Islamia Government College, Sirajganj, achieving a GPA of 4.17 out of 5. During these college years, I took my first steps into the world of coding and web development. I learned the basics of C programming, HTML, and CSS, which sparked my interest in software and web technologies. This period marked the foundation of my journey into programming and development.",
      degree: "Higher Secondary School Certificate (HSC)-Science",
    },
    {
      id: 2,
      img: vpsLogo,
      school: "Tarakandi High School, Kazipur, Sirajganj",
      date: "Jan 2011 - March 2016",
      grade: "4.78/5",
      desc: "I completed my Secondary School Certificate (SSC) from Tarakandi High School, Kazipur, Sirajganj, securing a GPA of 4.78 out of 5. During my school years, I developed a strong interest in Mathematics, Science, and Computer studies. It was also during this time that I first discovered my passion for programming, which later shaped my academic and career journey.",
      degree: "Secondary School Certificate (SSC)",
    },
    {
      id: 3,
      img: primary,
      school: "Paniabari Government Primary School, Bagbati, Sirajganj",
      date: "December 2010",
      grade: "87.5%",
      desc: "I completed my primary education from Paniabari Government Primary School, Bagbati, Sirajganj, achieving an 87.5% score in the Primary Education Completion (PEC) exam. During this time, I developed a strong interest in Mathematics, Science, and Computer studies, which later shaped my academic journey.",

      degree: "Primary Education Completion (PEC)",
    },
  ];
  
  export const projects = [
    {
      id: 0,
      title: "Laravel eCommerce Project",
      description:
        "A user-friendly eCommerce website developed with Laravel, featuring secure user registration and login system using Laravel Auth. The project includes dynamic product management, category listings, shopping cart functionality, and order placement. Designed with clean Blade templates and a responsive interface to ensure a seamless and intuitive shopping experience.",
      image: githubdetLogo,
      tags: [
        "HTML",
        "CSS",
        "JavaScript",
        "Laravel",
        "Laravel API",
        "Auth",
        "Blade",
        "Bootstrap",
      ],
      github:
        "https://github.com/Ashraful-Ahsan/ecommerce-project-by-laravel-ashraful",
        webapp: "#",
    },
    {
      id: 1,
      title: "Laravel eCommerce Project",
      description:
        "A user-friendly eCommerce website developed with Laravel, featuring secure user registration and login system using Laravel Auth. The project includes dynamic product management, category listings, shopping cart functionality, and order placement. Designed with clean Blade templates and a responsive interface to ensure a seamless and intuitive shopping experience.",
      image: githubdetLogo,
      tags: [
        "HTML",
        "CSS",
        "JavaScript",
        "Laravel",
        "Laravel API",
        "Auth",
        "Blade",
        "Bootstrap",
      ],
      github:
        "https://github.com/Ashraful-Ahsan/ecommerce-project-by-laravel-ashraful",
        webapp: "#",
    },
    {
      id: 2,
      title: "Laravel eCommerce Project",
      description:
        "A user-friendly eCommerce website developed with Laravel, featuring secure user registration and login system using Laravel Auth. The project includes dynamic product management, category listings, shopping cart functionality, and order placement. Designed with clean Blade templates and a responsive interface to ensure a seamless and intuitive shopping experience.",
      image: githubdetLogo,
      tags: [
        "HTML",
        "CSS",
        "JavaScript",
        "Laravel",
        "Laravel API",
        "Auth",
        "Blade",
        "Bootstrap",
      ],
      github:
        "https://github.com/Ashraful-Ahsan/ecommerce-project-by-laravel-ashraful",
        webapp: "#",
    },
    
  ];  