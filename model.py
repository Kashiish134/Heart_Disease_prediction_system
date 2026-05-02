#!/usr/bin/env python
# coding: utf-8

# In[6]:


import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle

# Column names
columns = [
    "age","sex","cp","trestbps","chol","fbs","restecg",
    "thalach","exang","oldpeak","slope","ca","thal","target"
]

# Load dataset
data = pd.read_csv("health.csv", names=columns)

# Replace ? with NaN and remove
data = data.replace("?", pd.NA).dropna()

# Convert to numeric
data = data.apply(pd.to_numeric)

# Convert target to binary
data["target"] = data["target"].apply(lambda x: 1 if x > 0 else 0)

# Split
X = data.drop("target", axis=1)
y = data["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Accuracy
accuracy = model.score(X_test, y_test)
print("Model Accuracy:", accuracy)

# Save model
pickle.dump(model, open("heart_model.pkl", "wb"))

print("Model saved as heart_model.pkl")


# In[ ]:




