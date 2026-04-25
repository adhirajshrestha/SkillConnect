export const CATEGORIES = [
    {
        group: "Technology & Digital Skills",
        items: [
            "Web Development",
            "Mobile App Development",
            "Data Science & Analytics",
            "AI & Machine Learning",
            "Cybersecurity",
            "Cloud Computing",
            "UI / UX Design"
        ]
    },
    {
        group: "Creative & Design",
        items: [
            "Graphic Design",
            "Motion Graphics",
            "Video Editing",
            "Photography",
            "Illustration & Digital Art",
            "3D Design & Animation",
            "Branding & Visual Identity"
        ]
    },
    {
        group: "Academics & Education",
        items: [
            "Mathematics",
            "Science (Physics, Chemistry, Biology)",
            "Computer Science",
            "Engineering Basics",
            "Economics",
            "Exam Preparation",
            "Research & Writing"
        ]
    },
    {
        group: "Personal Growth",
        items: [
            "Communication Skills",
            "Public Speaking",
            "Leadership",
            "Time Management",
            "Critical Thinking",
            "Emotional Intelligence",
            "Career Development",
            "Home & Lifestyles"

        ]
    }
];

export const ALL_CATEGORIES = CATEGORIES.reduce((acc, cat) => [...acc, ...cat.items], []);
