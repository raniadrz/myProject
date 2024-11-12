import React from 'react';
import './Team.css';
import Layout from '../../../components/layout/Layout';

const Team = () => {
  const teamMembers = [
    {
      name: 'Jane Doe',
      role: 'Founder & CEO',
      bio: 'Former co-founder of PetCare. Early staff at PawsForward and PetLovers.',
      image: 'https://img.freepik.com/premium-photo/profile-view-portrait-serious-young-woman-blue-background-copy-space_116407-31865.jpg',
    },
    {
      name: 'John Smith',
      role: 'Engineering Manager',
      bio: 'Lead engineering teams at PetTech, FurryFriends, and PawsomeLabs',
      image: 'https://img.freepik.com/free-photo/seriously-girl-is-looking-camera-by-holding-forefinger-forehead-blue-background_176474-118549.jpg',
    },
    {
      name: 'Emily Brown',
      role: 'Product Designer',
      bio: 'Founding design team at PetPal. Former Whiskers, Pawsome, and TailWag.',
      image: 'https://www.perfocal.com/blog/content/images/2021/01/Perfocal_17-11-2019_TYWFAQ_100_standard-3.jpg',
    },
    {
      name: 'Michael Johnson',
      role: 'Frontend Developer',
      bio: 'Former frontend dev for PetNet, PawBase, and PetScript.',
      image: 'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg',
    },
    {
      name: 'Sarah Lee',
      role: 'UX Researcher',
      bio: 'Lead user research for PetSmart. Contractor for PetCo and PetWorld.',
      image: 'https://www.shutterstock.com/image-photo/head-shot-portrait-close-smiling-600nw-1714666150.jpg',
    },
  ];

  return (
    <Layout>
    <div className="footer-page team-page">
      <h1>Meet the talented team who make all this happen</h1>
      <p className="team-philosophy">
        Our philosophy is simple; hire great people and give them the resources
        and support to do their best work.
      </p>
      <div className="team-members">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-member">
            <img src={member.image} alt={member.name} className="member-photo" />
            <h2>{member.name}</h2>
            <p className="member-role">{member.role}</p>
            <p className="member-bio">{member.bio}</p>
          </div>
        ))}
      </div>
    </div>
    </Layout>
  );
};

export default Team;