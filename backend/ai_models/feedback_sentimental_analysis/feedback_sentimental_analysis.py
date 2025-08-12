#!/usr/bin/env python
# coding: utf-8

# In[ ]:


get_ipython().system('pip install -q google_play_scraper # Scraping reviews')
get_ipython().system('pip install -q transformers # Sentiment and Summarization')
get_ipython().system('pip install -q plotly-express # Data Visualization')
get_ipython().system('pip install pyyaml==5.4.1')


# In[ ]:


import pandas as pd
import numpy as np
from google_play_scraper import app, Sort, reviews_all
import plotly.express as px
from transformers import pipeline
from sklearn.metrics import accuracy_score


# In[ ]:


# Scraping reviews for the app "cris.railmadad" from Google Play Store
rm_project = reviews_all('cris.railmadad', sleep_milliseconds=0, lang='en', country='IN', sort=Sort.NEWEST)

# Normalizing the reviews into a DataFrame
df = pd.json_normalize(rm_project)

# Display the first few rows of the dataframe to inspect
df.head()


# In[ ]:


# Load the sentiment analysis pipeline for positive/negative sentiment
sentiment_analysis = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")


# In[ ]:


df['content'] = df['content'].astype('str')


# In[ ]:


# Load the BART model for summarization
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Function to summarize long reviews
def summarize_review(review, max_length=512):
    if len(review.split()) > max_length:
        summary = summarizer(review, max_length=150, min_length=50, do_sample=False)
        return summary[0]['summary_text']
    return review

# Apply summarization to long reviews
df['summarized_content'] = df['content'].apply(lambda x: summarize_review(x))

# Display the first few rows with summarized content
df.head()


# In[ ]:


# Mapping star ratings (1-3 -> positive, 4-5 -> negative) for ground truth sentiment
def map_star_to_sentiment(star_rating):
    if star_rating in [1, 2]:
        return 'NEGATIVE'   # Consider 1-3 stars as positive
    elif star_rating in [4, 5]:
        return 'POSITIVE'   # 4-5 stars as negative
    else:
      return 'NEUTRAL'      # Optional, for cases with no matching star

# Apply mapping to create ground truth sentiment (based on the original star ratings)
df['ground_truth_sentiment'] = df['score'].apply(map_star_to_sentiment)

# Display the DataFrame with ground truth sentiment
df.head()


# In[ ]:


# Apply sentiment analysis using the model
df['result'] = df['summarized_content'].apply(lambda x: sentiment_analysis(x)[0])

# Extract the predicted sentiment (label) and score (confidence) into separate columns
df['sentiment'] = df['result'].apply(lambda x: x['label'])
df['score'] = df['result'].apply(lambda x: x['score'])

# Display the DataFrame with predicted sentiment and sentiment score
df.head()


# In[ ]:


# Display the distribution of ground truth sentiments
print(df['ground_truth_sentiment'].value_counts())

# Filter out rows where ground truth sentiment is 'NEUTRAL' (if you want to focus on positive/negative)
df_filtered = df[df['ground_truth_sentiment'] != 'NEUTRAL']

# Check how many rows are left after filtering neutral sentiments
print(f"Rows after filtering for 'NEUTRAL' sentiment: {len(df_filtered)}")

# Calculate accuracy by comparing ground truth sentiment with predicted sentiment
accuracy = accuracy_score(df_filtered['ground_truth_sentiment'], df_filtered['sentiment'])

# Display accuracy as percentage
accuracy_percentage = accuracy * 100
print(f"Accuracy: {accuracy_percentage:.2f}%")


# In[ ]:


fig = px.histogram(df, x='sentiment', color='sentiment', text_auto=True)

fig.show()


# In[ ]:


def interactive_prediction():
    while True:
        # Input a review text from the user
        user_input = input("Enter a review to predict its sentiment (or type 'exit' to quit): ")

        # Check if user wants to exit
        if user_input.lower() == 'exit':
            print("Exiting interactive prediction.")
            break

        # Summarize the input if it's too long
        summarized_input = summarize_review(user_input)

        # Predict sentiment using the model
        prediction = sentiment_analysis(summarized_input)

        # Output the sentiment prediction
        print(f"Predicted Sentiment: {prediction[0]['label']}")

# Call the interactive prediction function
interactive_prediction()


# In[ ]:




