# 🧠 AI Health Risk Prediction

Welcome to the **AI Health Risk Prediction** project! This folder contains all the essential files to train and test a XGBoost machine learning model that predicts obesity-related health risks using BMI and other factors.

## 📁 Contents

- `fai_health_prediction.ipynb`  
  → The main Jupyter Notebook file that includes data preprocessing, training, and evaluation of the model. Designed for Kaggle environment.

- `ObesityDataset_raw_and_data_sinthetic.csv`  
  → The primary training dataset used for model training.

- `obesity_test_data.csv`  
  → A separate test dataset used to evaluate the model's performance.

- `trained_model.pkl`  
  → The serialized (Pickle) file of the trained model, ready for deployment or further testing.

## 🧪 How to Use

1. Open `fai_health_prediction.ipynb` in a Jupyter environment (e.g., Kaggle or JupyterLab).
2. Ensure the datasets are in the same directory.
3. Run the notebook to preprocess data, train the model, and evaluate its performance.
4. The final trained model is saved in `trained_model` folder.

## ✅ Requirements

- Python 3.x
- pandas
- numpy
- scikit-learn
- matplotlib / seaborn (for visualization)

## 📊 Dataset Source

The dataset includes both raw and synthetic data to help improve model robustness. Features include physical measurements, lifestyle habits, and more.

---

🔒 **Note**: Ensure data privacy and compliance with health data usage guidelines if deploying this model in a production environment.

