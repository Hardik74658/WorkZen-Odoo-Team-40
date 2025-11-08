import React from 'react'
import ProfilePic from '../../assets/ProfilePic.png' // Import the image directly

const people = [
    {
      name: 'Hardik Songara',
      role: 'Founder',
      imageUrl: ProfilePic, // Use imported image
    },
    // Add more team members here if needed
]

export default function Team() {
  const isSingleMember = people.length === 1; // Check if there is only one team member

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading & Subheading */}
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Our team
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We’re a dynamic group of individuals who are passionate about what we do and dedicated to delivering the best
            results for our clients.
          </p>
        </div>

        {/* Team Members Grid */}
        <ul
          role="list"
          className={`mx-auto mt-10 ${
            isSingleMember
              ? 'flex flex-col items-center' // Center content for a single member
              : 'grid max-w-2xl grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {people.map((person) => (
            <li
              key={person.name}
              className={`flex flex-col items-center text-center ${
                isSingleMember ? '' : 'sm:items-start sm:text-left'
              }`}
            >
              <img
                className="h-40 w-40 rounded-4xl object-cover sm:h-48 sm:w-48"
                src={person.imageUrl} // Use dynamic imageUrl
                alt={person.name}
              />
              <div className="mt-4 sm:mt-6">
                <h3 className="text-lg font-semibold leading-8 tracking-tight text-gray-900">{person.name}</h3>
                <p className="text-brand">{person.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
