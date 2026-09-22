# ❤️ Heart Disease Prediction System

> A machine learning-based web application that predicts the likelihood of heart disease using clinical patient data.

## 📌 Overview

**Heart Disease Prediction System** is a machine learning project that uses patient health and clinical parameters to predict whether a person is likely to have heart disease.

The project uses the **Cleveland Heart Disease dataset** and a **Random Forest Classifier** for prediction. A Flask-based web application provides an interface through which users can enter patient information and receive a prediction.

The project demonstrates the complete machine learning workflow:

```text
Dataset
   ↓
Data Preprocessing
   ↓
Exploratory Data Analysis
   ↓
Feature Selection
   ↓
Model Training
   ↓
Model Evaluation
   ↓
Model Saving
   ↓
Flask Web Application
   ↓
Prediction
```

---

## ✨ Features

* ❤️ Heart disease prediction
* 🧠 Machine learning-based classification
* 🌲 Random Forest Classifier
* 📊 Dataset analysis
* 🔢 Clinical feature processing
* 📈 Model evaluation
* 💾 Trained model saved using Pickle
* 🌐 Flask web application
* 🖥️ User-friendly prediction interface

---

## 🧠 Machine Learning Model

The project uses a **Random Forest Classifier**.

Random Forest combines multiple decision trees to make a final classification. This makes it useful for classification problems involving multiple clinical features.

### Model Workflow

```text
Patient Data
     ↓
Input Validation
     ↓
Feature Processing
     ↓
Random Forest Model
     ↓
Prediction
     ↓
Heart Disease / No Heart Disease
```

---

## 📊 Dataset

The project uses the **Cleveland Heart Disease dataset**.

The dataset contains approximately **303 patient records** and multiple clinical attributes used for predicting heart disease.

Important features include:

| Feature             | Description                            |
| ------------------- | -------------------------------------- |
| Age                 | Age of the patient                     |
| Sex                 | Biological sex recorded in the dataset |
| Chest Pain          | Type of chest pain                     |
| Resting BP          | Resting blood pressure                 |
| Cholesterol         | Serum cholesterol                      |
| Fasting Blood Sugar | Fasting blood sugar indicator          |
| Resting ECG         | Resting electrocardiographic results   |
| Max Heart Rate      | Maximum heart rate achieved            |
| Exercise Angina     | Exercise-induced angina                |
| Oldpeak             | ST depression induced by exercise      |
| Slope               | Slope of peak exercise ST segment      |
| CA                  | Number of major vessels                |
| Thal                | Thalassemia-related feature            |

> The exact feature encoding should match the preprocessing used during model training.

---

## 🛠️ Technologies Used

### Programming Language

* Python

### Machine Learning

* Scikit-learn
* Random Forest Classifier
* NumPy
* Pandas

### Data Visualization

* Matplotlib

### Web Framework

* Flask

### Model Storage

* Pickle

### Development Tools

* Jupyter Notebook
* VS Code
* Git
* GitHub

---

## 📂 Project Structure

```text
heart-disease-prediction/
│
├── app.py
├── heart_model.pkl
├── dataset/
│   └── heart.csv
│
├── templates/
│   └── index.html
│
├── static/
│   ├── css/
│   └── images/
│
├── notebooks/
│   └── heart_disease_analysis.ipynb
│
├── requirements.txt
├── README.md
└── .gitignore
```

> Adjust the folder names above to match your actual repository structure.

---

## 🔬 Machine Learning Pipeline

### 1. Data Collection

The Cleveland heart disease dataset is used as the input dataset.

### 2. Data Preprocessing

The dataset is cleaned and prepared for machine learning.

Typical preprocessing steps include:

* Handling missing values
* Separating features and target
* Converting categorical values where required
* Preparing numerical features
* Splitting data into training and testing sets

### 3. Train-Test Split

The dataset is divided into training and testing subsets.

```text
Dataset
   │
   ├── Training Data
   │
   └── Testing Data
```

### 4. Model Training

A Random Forest Classifier is trained using the processed training data.

```python
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)
```

### 5. Model Evaluation

The trained model is evaluated using the testing dataset.

Evaluation can include:

* Accuracy
* Precision
* Recall
* F1-score
* Confusion Matrix

The model achieved approximately **83–85% accuracy** in the project experiments, depending on the preprocessing and train/test configuration used.

---

## 💾 Saving the Model

After training, the model is saved using Pickle.

```python
import pickle

with open("heart_model.pkl", "wb") as file:
    pickle.dump(model, file)
```

The saved model can then be loaded by the Flask application without retraining it every time.

---

## 🌐 Flask Application

The trained model is integrated into a Flask web application.

### Prediction Workflow

```text
User
 │
 ▼
Flask Web Interface
 │
 ▼
Enter Patient Information
 │
 ▼
Flask Backend
 │
 ▼
Load heart_model.pkl
 │
 ▼
Process Input
 │
 ▼
Random Forest Model
 │
 ▼
Prediction
 │
 ▼
Display Result
```

---

## 🔌 Prediction Endpoint

The Flask application receives patient information and sends it to the trained model.

Example structure:

```text
POST /predict
```

The submitted features are processed and passed to the machine learning model.

The application then returns the prediction to the user.

---

## 🖥️ Application Preview

Add screenshots of your application here:

```markdown
## 📸 Screenshots

### Home Page

![Home Page](screenshots/home.png)

### Prediction Form

![Prediction Form](screenshots/prediction-form.png)

### Prediction Result

![Prediction Result](screenshots/result.png)
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Kashiish134/heart-disease-prediction.git
```

### 2. Navigate to the Project

```bash
cd heart-disease-prediction
```

### 3. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

If you haven't created `requirements.txt` yet:

```bash
pip install flask pandas numpy scikit-learn matplotlib
```

Then:

```bash
pip freeze > requirements.txt
```

### 5. Run the Application

```bash
python app.py
```

The application will normally be available at:

```text
http://127.0.0.1:5000/
```

---

## 🧪 Example Prediction

The user enters the required clinical information:

```text
Age
Sex
Chest Pain Type
Resting Blood Pressure
Cholesterol
Maximum Heart Rate
Exercise Angina
Oldpeak
...
```

The model processes the input and returns a classification result.

Example:

```text
Prediction: Heart Disease Detected
```

or

```text
Prediction: No Heart Disease Detected
```

---

## 📈 Model Evaluation

The project achieved approximately:

```text
Accuracy: ~83–85%
```

Additional evaluation metrics can be displayed using:

```python
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)
```

Example:

```python
print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))
```

---

## 🎯 Project Objectives

The main objectives of this project are:

* Apply machine learning to a real-world classification problem
* Understand healthcare-related datasets
* Practice data preprocessing
* Train and evaluate a classification model
* Deploy a trained ML model using Flask
* Build an interactive prediction interface
* Understand the complete ML-to-web-application workflow

---

## 🧠 What I Learned

Through this project, I gained practical experience in:

* Python programming
* Pandas and NumPy
* Data preprocessing
* Exploratory data analysis
* Machine learning
* Random Forest classification
* Model evaluation
* Model serialization
* Flask development
* Connecting ML models with web applications

---

## 🔮 Future Improvements

Potential improvements include:

* 📊 Add interactive data visualizations
* 📈 Display prediction confidence/probability
* 🧪 Compare multiple ML algorithms
* 🌲 Compare Random Forest with XGBoost, Logistic Regression and SVM
* 🔍 Add feature importance visualization
* 🔐 Add user authentication
* 🗄️ Store prediction history
* 📱 Improve mobile responsiveness
* ☁️ Deploy the application to the cloud
* 📊 Add a model-performance dashboard

---

## ⚠️ Disclaimer

This project is intended for **educational and demonstration purposes only**.

The predictions generated by this application should **not be used as a medical diagnosis or as a substitute for evaluation by a qualified healthcare professional**.

---

## 👨‍💻 Author

**Kashish Aggarwal**

GitHub: [Kashiish134](https://github.com/Kashiish134)

---

⭐ If you found this project interesting, consider giving the repository a star!
