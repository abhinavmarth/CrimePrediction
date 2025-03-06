import pandas as pd
import numpy as np
import geopandas as gpd
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from geopy.geocoders import Nominatim
import seaborn as sns

data = pd.read_csv("crime_data.csv")

data.fillna(0, inplace=True)


features = data[['Cases_Property_Recovered', 'Cases_Property_Stolen']]
labels = (features['Cases_Property_Recovered'] + features['Cases_Property_Stolen']).apply(lambda x: 1 if x > 1000 else 0)

scaler = StandardScaler()
features_scaled = scaler.fit_transform(features)


X_train, X_test, y_train, y_test = train_test_split(features_scaled, labels, test_size=0.3, random_state=42)


model = Sequential()
model.add(Dense(64, input_dim=2, activation='relu'))
model.add(Dense(32, activation='relu'))
model.add(Dense(1, activation='sigmoid')) 


model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])


model.fit(X_train, y_train, epochs=10, batch_size=32, validation_data=(X_test, y_test))


predictions = model.predict(X_test)
predictions = (predictions > 0.5).astype(int)


geolocator = Nominatim(user_agent="crime_map")
data['Coordinates'] = data['Area_Name'].apply(lambda x: geolocator.geocode(x))


area_coordinates = {
    'Andaman & Nicobar Islands': (10.3182, 92.7467),
    'Andhra Pradesh': (17.3616, 78.4747),
    'Arunachal Pradesh': (27.0986, 93.6053),
}

data['Lat_Long'] = data['Area_Name'].map(area_coordinates)

india_map = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))
india_map = india_map[india_map.name == "India"]


high_crime = data[data['Area_Name'].isin(data['Area_Name'][predictions == 1])]
low_crime = data[data['Area_Name'].isin(data['Area_Name'][predictions == 0])]


fig, ax = plt.subplots(figsize=(10, 10))
india_map.plot(ax=ax, color='lightgray')


ax.scatter(high_crime['Lat_Long'].apply(lambda x: x[1]), high_crime['Lat_Long'].apply(lambda x: x[0]),
           color='red', label='High Crime', alpha=0.5)

ax.scatter(low_crime['Lat_Long'].apply(lambda x: x[1]), low_crime['Lat_Long'].apply(lambda x: x[0]),
           color='green', label='Low Crime', alpha=0.5)

plt.legend()
plt.title("Crime Severity in India (High vs Low)")
plt.show()
