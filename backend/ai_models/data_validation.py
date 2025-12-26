"""
Data Validation and Deduplication for Railway Complaints
- Remove near-duplicates using similarity metrics
- Validate label consistency
- Check data quality
"""

import pandas as pd
import numpy as np
from typing import List, Tuple
from collections import Counter
import re
from difflib import SequenceMatcher


class DataValidator:
    """Validate and clean complaint dataset"""
    
    def __init__(self, similarity_threshold: float = 0.85):
        """
        Args:
            similarity_threshold: Threshold for considering texts as duplicates (0-1)
        """
        self.similarity_threshold = similarity_threshold
    
    def text_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts using sequence matching"""
        return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()
    
    def find_near_duplicates(self, texts: List[str]) -> List[Tuple[int, int, float]]:
        """
        Find near-duplicate texts
        
        Returns:
            List of (index1, index2, similarity_score) tuples
        """
        duplicates = []
        n = len(texts)
        
        print(f"🔍 Checking {n} texts for near-duplicates...")
        
        for i in range(n):
            if i % 500 == 0:
                print(f"  Progress: {i}/{n}")
            
            for j in range(i + 1, min(i + 100, n)):  # Check only nearby texts (after shuffling)
                similarity = self.text_similarity(texts[i], texts[j])
                if similarity >= self.similarity_threshold:
                    duplicates.append((i, j, similarity))
        
        return duplicates
    
    def remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove near-duplicate complaints"""
        print("\n" + "="*70)
        print("DEDUPLICATION PROCESS")
        print("="*70)
        
        original_size = len(df)
        print(f"\n📊 Original dataset size: {original_size}")
        
        # Find duplicates
        duplicates = self.find_near_duplicates(df['Complaint Description'].tolist())
        
        if not duplicates:
            print("✅ No near-duplicates found!")
            return df
        
        print(f"\n⚠️  Found {len(duplicates)} near-duplicate pairs")
        
        # Keep track of indices to remove (keep first occurrence)
        indices_to_remove = set()
        for idx1, idx2, sim in duplicates:
            indices_to_remove.add(idx2)
            if len(indices_to_remove) % 100 == 0:
                print(f"  Marked {len(indices_to_remove)} duplicates for removal")
        
        # Remove duplicates
        df_cleaned = df.drop(indices_to_remove).reset_index(drop=True)
        
        removed = original_size - len(df_cleaned)
        print(f"\n✅ Removed {removed} duplicates ({removed/original_size*100:.1f}%)")
        print(f"📊 Final dataset size: {len(df_cleaned)}")
        
        return df_cleaned
    
    def validate_labels(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate label consistency"""
        print("\n" + "="*70)
        print("LABEL VALIDATION")
        print("="*70)
        
        required_columns = ['Category', 'Complaint Description', 'Staff Assignment', 
                          'Auto Priority', 'Auto Severity']
        
        # Check missing columns
        missing = [col for col in required_columns if col not in df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")
        
        print("\n✅ All required columns present")
        
        # Check for missing values
        print("\n📊 Missing values:")
        missing_counts = df[required_columns].isnull().sum()
        for col, count in missing_counts.items():
            if count > 0:
                print(f"  ⚠️  {col}: {count} missing")
        
        # Drop rows with missing values
        df_clean = df.dropna(subset=required_columns)
        dropped = len(df) - len(df_clean)
        if dropped > 0:
            print(f"\n⚠️  Dropped {dropped} rows with missing values")
        
        # Validate complaint length
        print("\n📝 Validating complaint descriptions:")
        df_clean['word_count'] = df_clean['Complaint Description'].str.split().str.len()
        
        short_complaints = df_clean[df_clean['word_count'] < 5]
        if len(short_complaints) > 0:
            print(f"  ⚠️  Found {len(short_complaints)} complaints with < 5 words")
            # Remove very short complaints
            df_clean = df_clean[df_clean['word_count'] >= 5]
        
        avg_words = df_clean['word_count'].mean()
        print(f"  ✓ Average words per complaint: {avg_words:.1f}")
        
        df_clean = df_clean.drop('word_count', axis=1)
        
        # Validate category distribution
        print("\n📊 Category distribution:")
        category_counts = df_clean['Category'].value_counts()
        print(category_counts)
        
        # Check for imbalanced classes
        min_count = category_counts.min()
        max_count = category_counts.max()
        imbalance_ratio = max_count / min_count if min_count > 0 else float('inf')
        
        if imbalance_ratio > 2:
            print(f"  ⚠️  Class imbalance detected (ratio: {imbalance_ratio:.2f})")
        else:
            print(f"  ✓ Classes are balanced (ratio: {imbalance_ratio:.2f})")
        
        # Validate label mappings
        print("\n🔗 Validating label mappings:")
        
        # Check if certain categories always map to specific staff
        category_staff_mapping = df_clean.groupby('Category')['Staff Assignment'].agg(
            lambda x: x.value_counts().index[0] if len(x.value_counts()) > 0 else None
        )
        
        print("  Dominant staff per category:")
        for cat, staff in category_staff_mapping.items():
            count = len(df_clean[(df_clean['Category'] == cat) & 
                                (df_clean['Staff Assignment'] == staff)])
            total = len(df_clean[df_clean['Category'] == cat])
            pct = count/total*100 if total > 0 else 0
            print(f"    {cat[:30]:<30} → {staff:<20} ({pct:.0f}%)")
        
        return df_clean
    
    def analyze_quality(self, df: pd.DataFrame):
        """Analyze dataset quality"""
        print("\n" + "="*70)
        print("DATASET QUALITY ANALYSIS")
        print("="*70)
        
        print(f"\n📊 Dataset Statistics:")
        print(f"  Total samples: {len(df)}")
        print(f"  Unique categories: {df['Category'].nunique()}")
        print(f"  Unique staff types: {df['Staff Assignment'].nunique()}")
        print(f"  Unique priorities: {df['Auto Priority'].nunique()}")
        print(f"  Unique severities: {df['Auto Severity'].nunique()}")
        
        # Text statistics
        df['text_length'] = df['Complaint Description'].str.len()
        df['word_count'] = df['Complaint Description'].str.split().str.len()
        
        print(f"\n📝 Text Statistics:")
        print(f"  Avg character length: {df['text_length'].mean():.0f}")
        print(f"  Avg word count: {df['word_count'].mean():.1f}")
        print(f"  Min words: {df['word_count'].min()}")
        print(f"  Max words: {df['word_count'].max()}")
        
        df = df.drop(['text_length', 'word_count'], axis=1)
        
        # Distribution analysis
        print(f"\n📊 Class Distributions:")
        
        print(f"\nPriority:")
        for priority, count in df['Auto Priority'].value_counts().items():
            pct = count/len(df)*100
            print(f"  {priority:<10}: {count:>4} ({pct:>5.1f}%)")
        
        print(f"\nSeverity:")
        for severity, count in df['Auto Severity'].value_counts().items():
            pct = count/len(df)*100
            print(f"  {severity:<10}: {count:>4} ({pct:>5.1f}%)")
        
        # Check for potential label errors
        print(f"\n🔍 Checking for potential label inconsistencies...")
        
        # Find complaints with same text but different labels
        text_label_groups = df.groupby('Complaint Description').agg({
            'Category': 'nunique',
            'Staff Assignment': 'nunique',
            'Auto Priority': 'nunique',
            'Auto Severity': 'nunique'
        })
        
        inconsistent = text_label_groups[
            (text_label_groups['Category'] > 1) | 
            (text_label_groups['Staff Assignment'] > 1) |
            (text_label_groups['Auto Priority'] > 1) |
            (text_label_groups['Auto Severity'] > 1)
        ]
        
        if len(inconsistent) > 0:
            print(f"  ⚠️  Found {len(inconsistent)} texts with inconsistent labels")
        else:
            print(f"  ✓ No label inconsistencies found")


def main():
    """Main validation script"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Validate and deduplicate dataset')
    parser.add_argument('--input', type=str, required=True, help='Input CSV file')
    parser.add_argument('--output', type=str, required=True, help='Output CSV file')
    parser.add_argument('--similarity-threshold', type=float, default=0.85,
                       help='Similarity threshold for duplicates (default: 0.85)')
    parser.add_argument('--skip-dedup', action='store_true',
                       help='Skip deduplication (only validate)')
    
    args = parser.parse_args()
    
    # Load data
    print(f"📂 Loading data from: {args.input}")
    df = pd.read_csv(args.input)
    
    # Initialize validator
    validator = DataValidator(similarity_threshold=args.similarity_threshold)
    
    # Validate labels
    df_validated = validator.validate_labels(df)
    
    # Remove duplicates (unless skipped)
    if not args.skip_dedup:
        df_clean = validator.remove_duplicates(df_validated)
    else:
        print("\n⏭️  Skipping deduplication")
        df_clean = df_validated
    
    # Analyze quality
    validator.analyze_quality(df_clean)
    
    # Save cleaned data
    print(f"\n💾 Saving cleaned dataset to: {args.output}")
    df_clean.to_csv(args.output, index=False)
    
    print("\n" + "="*70)
    print("✅ VALIDATION COMPLETE")
    print("="*70)
    print(f"Original size: {len(df)}")
    print(f"Final size: {len(df_clean)}")
    print(f"Removed: {len(df) - len(df_clean)} samples")
    print("="*70)


if __name__ == '__main__':
    main()
