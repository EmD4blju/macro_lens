# Macro Lens 🔍

Macro Lens is an AI-powered nutrition tracker that simplifies food logging. By leveraging advanced computer vision and large language models, it allows users to upload photos of their meals to automatically estimate nutritional information, including calories, protein, fat, and carbohydrates.

## Features 🚀

-   **AI-Powered Analysis**: Upload a photo of your meal, and the system automatically identifies the food items and estimates their macros.
-   **Daily Food Log**: Keep track of your daily intake with an easy-to-use interface.
-   **Nutritional Breakdown**: Get detailed stats on calories, protein, fats, and carbs for each entry.

## Technology Stack ⚙️

-   **Backend**: FastAPI, SQLModel (PostgreSQL), LangChain
-   **Frontend**: React, TypeScript, Vite, Tailwind CSS
-   **AI Model**: Google Gemini 2.5 Flash (via `langchain-google-genai`)

## Project Structure 🗂️

```
macro_lens/
├── backend/                # FastAPI backend application
│   ├── database.py         # Database connection and configuration
│   ├── docker-compose.yaml # Docker orchestration (if applicable)
│   ├── estimator.py        # logic for AI macro estimation
│   ├── main.py             # API endpoints and app entry point
│   ├── models.py           # SQLModel database schemas
│   └── pyproject.toml      # Python dependencies
├── frontend/               # React frontend application
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── api/            # Axios API configuration
│   │   ├── assets/         # Images and styles
│   │   ├── hooks/          # Custom React hooks (useFood, useHealth)
│   │   ├── models/         # TypeScript interfaces
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   ├── index.html          # HTML template
│   ├── package.json        # Node.js dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   └── vite.config.ts      # Vite configuration
├── LICENSE.md              # License file
└── README.md               # Project documentation
```

## How It Works 💡

1.  **Upload**: The user uploads an image of their food via the frontend.
2.  **Process**: The backend receives the image and sends it to the **Gemini 2.5 Flash** model.
3.  **Analyze**: The LLM analyzes the visual data to identify food items and estimate their nutritional content based on portion sizes.
4.  **Save**: The estimated data is returned to the backend, structured, and saved to the database.
5.  **View**: The user sees the logged meal and its nutritional stats in their daily log.
