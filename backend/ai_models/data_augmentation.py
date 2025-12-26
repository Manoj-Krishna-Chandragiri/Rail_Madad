"""
Advanced Data Augmentation for Railway Complaint Classification
Techniques: Paraphrasing, Back-translation, Template-based generation
Goal: Expand dataset to 4,000-6,000 samples with balanced classes
"""

import pandas as pd
import numpy as np
import random
from typing import List, Dict, Tuple
import re
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

# Try to import optional libraries
try:
    from googletrans import Translator
    TRANSLATOR_AVAILABLE = True
except:
    TRANSLATOR_AVAILABLE = False
    print("⚠️ googletrans not available. Back-translation disabled.")


class ComplaintAugmenter:
    """Augment railway complaint data using multiple techniques"""
    
    def __init__(self, seed=42):
        self.seed = seed
        random.seed(seed)
        np.random.seed(seed)
        
        if TRANSLATOR_AVAILABLE:
            self.translator = Translator()
        
        # Synonym dictionaries for paraphrasing
        self.synonyms = {
            'dirty': ['filthy', 'unclean', 'grimy', 'soiled', 'contaminated', 'unhygienic'],
            'clean': ['spotless', 'hygienic', 'sanitized', 'pristine'],
            'broken': ['damaged', 'defective', 'malfunctioning', 'faulty', 'not working'],
            'smell': ['odor', 'stench', 'foul smell', 'bad odor', 'terrible smell'],
            'bad': ['poor', 'terrible', 'awful', 'horrible', 'dreadful'],
            'good': ['excellent', 'great', 'wonderful', 'satisfactory'],
            'very': ['extremely', 'highly', 'incredibly', 'exceptionally'],
            'toilet': ['washroom', 'lavatory', 'restroom', 'bathroom'],
            'train': ['railway', 'coach'],
            'staff': ['personnel', 'employee', 'attendant', 'crew member'],
            'passenger': ['traveler', 'commuter', 'rider'],
            'food': ['meal', 'cuisine', 'catering', 'refreshment'],
            'late': ['delayed', 'behind schedule', 'not on time'],
            'stolen': ['robbed', 'taken', 'missing', 'snatched'],
            'rude': ['impolite', 'discourteous', 'disrespectful', 'unprofessional'],
            'help': ['assistance', 'support', 'aid'],
            'immediately': ['urgently', 'right away', 'as soon as possible', 'promptly'],
            'needs': ['requires', 'demands', 'must have'],
            'not working': ['out of order', 'broken', 'malfunctioning', 'faulty'],
        }
        
        # Category-specific templates
        self.templates = self._build_templates()
    
    def _build_templates(self) -> Dict[str, List[str]]:
        """Build category-specific complaint templates"""
        return {
            'Coach - Cleanliness': [
                "The {location} in coach {coach_num} is {cleanliness_issue} and {consequence}.",
                "I found {item} in the {location} which is {adjective} and needs {action}.",
                "The {location} has not been cleaned properly and there is {problem} everywhere.",
                "There are {pests} in the coach {location} causing {issue} to passengers.",
                "The {surface} is covered with {dirt_type} making it {condition} to use.",
            ],
            'Catering': [
                "The {food_item} served was {quality_issue} and had {problem}.",
                "Food quality is {adjective} and the {food_item} tastes {taste_issue}.",
                "The {staff_type} was {behavior_issue} when I complained about {food_problem}.",
                "I was charged {price_issue} for {food_item} which is {complaint}.",
                "The {food_item} contains {contaminant} and is {safety_issue}.",
            ],
            'Security': [
                "My {item} was {security_incident} from {location} while I was {activity}.",
                "There is no {security_personnel} present in the coach for passenger {need}.",
                "I am facing {harassment_type} from {perpetrator} in the {location}.",
                "Someone {criminal_act} and I need immediate {help_type}.",
                "Unauthorized {person_type} are {illegal_activity} in the coach creating {problem}.",
            ],
            'Electrical Equipment': [
                "The {electrical_item} in the coach is {malfunction_type} and {consequence}.",
                "There is no {utility} in the {location} making it {condition}.",
                "The {device} is {problem_type} and needs {action}.",
                "Electrical {component} is {issue} causing {safety_concern}.",
                "The {charging_point} is {status} and passengers cannot {action}.",
            ],
            'Water Availability': [
                "There is no {water_type} available in the {location} for {duration}.",
                "The water tap is {issue} and {consequence}.",
                "Water supply is {quality_issue} and appears {condition}.",
                "The {water_source} has been {problem} since {time}.",
                "Water is {flow_issue} from the tap making it {usability}.",
            ],
            'Punctuality': [
                "The train is running {delay_duration} late without any {communication}.",
                "The train {schedule_issue} and I {consequence}.",
                "There was no {information_type} about the {delay_issue}.",
                "The train {arrival_issue} causing passengers to {problem}.",
                "Due to {delay_reason}, the journey is delayed by {duration}.",
            ],
            'Medical Assistance': [
                "A passenger {medical_emergency} and needs immediate {help_type}.",
                "Someone is having {health_issue} and requires {medical_need}.",
                "Urgent medical {requirement} needed for {patient_type}.",
                "There is no {medical_facility} available in the coach during {emergency}.",
                "A {person} needs {medical_intervention} immediately to {purpose}.",
            ],
            'Passengers Behaviour': [
                "Co-passengers are {disruptive_behavior} and disturbing {who}.",
                "Someone is {inappropriate_act} which is {complaint_type}.",
                "Passengers are {violation} against railway rules creating {problem}.",
                "A group is {nuisance_type} in the coach despite {request}.",
                "People are {antisocial_behavior} making the journey {condition}.",
            ],
            'Staff Behaviour': [
                "The {staff_type} was {behavior_issue} when I {interaction}.",
                "Railway staff is {complaint} and not {expectation}.",
                "The {employee} {misconduct} which is {severity}.",
                "Staff member {action} despite {circumstance}.",
                "The {personnel} behaved {manner} and used {language}.",
            ],
            'Coach - Maintenance': [
                "The {component} is {malfunction} and {safety_issue}.",
                "My seat is {problem} making it {usability}.",
                "The {fixture} is {damage_type} and needs {action}.",
                "There is a {structural_issue} in the coach causing {problem}.",
                "The {facility} is {condition} and {consequence}.",
            ],
            'Bed Roll': [
                "The {bedding_item} provided is {quality_issue} and {problem}.",
                "Bedroll was not {delivery_issue} despite {payment_status}.",
                "The {linen_type} has {cleanliness_issue} and is {usability}.",
                "The {bedding_component} is {condition} and {complaint}.",
                "No {bedding_item} was given even after {action}.",
            ],
            'Passenger Amenities': [
                "The {amenity} is {status} and passengers cannot {action}.",
                "There is no {facility} provided in the {location}.",
                "The {amenity_type} is {condition} and needs {requirement}.",
                "Amenity {item} is {problem} making {consequence}.",
                "The {service} is {availability_issue} in this coach.",
            ],
            'Unreserved Ticketing': [
                "My ticket {booking_issue} and {consequence}.",
                "I was {pricing_issue} for the ticket which is {complaint}.",
                "The {ticket_type} was {problem} causing {issue}.",
                "Refund was {refund_issue} despite {eligibility}.",
                "The TTE {staff_action} regarding my {ticket_status}.",
            ],
            'Corruption': [
                "The {staff_type} demanded {bribe_type} for {service}.",
                "Railway employee {corrupt_act} which is {severity}.",
                "Staff is {misconduct} and {illegal_activity}.",
                "The {personnel} asked for {payment} to {action}.",
                "There is {corruption_type} happening by {perpetrator}.",
            ],
            'Miscellaneous': [
                "There is an issue with {general_problem} that needs {resolution}.",
                "I faced {problem_type} during {situation}.",
                "The {service} is {issue} causing {inconvenience}.",
                "There was {problem} which resulted in {consequence}.",
                "Railway {aspect} needs {improvement} to {goal}.",
            ],
        }
    
    def paraphrase_synonym_replacement(self, text: str, num_replacements: int = 3) -> str:
        """Replace words with synonyms"""
        words = text.split()
        indices = random.sample(range(len(words)), min(num_replacements, len(words)))
        
        for idx in indices:
            word_lower = words[idx].lower().strip('.,!?')
            if word_lower in self.synonyms:
                synonym = random.choice(self.synonyms[word_lower])
                # Preserve capitalization
                if words[idx][0].isupper():
                    synonym = synonym.capitalize()
                words[idx] = words[idx].replace(word_lower, synonym, 1)
        
        return ' '.join(words)
    
    def paraphrase_sentence_restructure(self, text: str) -> str:
        """Restructure sentences (simple transformations)"""
        transformations = [
            # Add intensifiers
            lambda t: t.replace(' is ', ' is very ').replace(' was ', ' was extremely '),
            # Add time context
            lambda t: t + ' This happened during my recent journey.',
            lambda t: 'I am reporting that ' + t.lower(),
            # Add emotional context
            lambda t: t + ' I am very disappointed with this.',
            lambda t: t + ' This needs urgent attention.',
            # Passive to active or vice versa
            lambda t: t.replace('was stolen', 'someone stole'),
            lambda t: t.replace('is not working', 'does not work'),
        ]
        
        transformation = random.choice(transformations)
        try:
            return transformation(text)
        except:
            return text
    
    def back_translate(self, text: str, intermediate_lang: str = 'hi') -> str:
        """Back-translation via Hindi (if available)"""
        if not TRANSLATOR_AVAILABLE:
            # Fallback to simple paraphrasing
            return self.paraphrase_synonym_replacement(text, 2)
        
        try:
            # Translate to intermediate language
            translated = self.translator.translate(text, dest=intermediate_lang)
            # Translate back to English
            back = self.translator.translate(translated.text, dest='en')
            return back.text
        except Exception as e:
            print(f"Back-translation failed: {e}")
            return self.paraphrase_synonym_replacement(text, 2)
    
    def generate_from_template(self, category: str, labels: Dict) -> str:
        """Generate complaint from category-specific template"""
        if category not in self.templates:
            return None
        
        template = random.choice(self.templates[category])
        
        # Fill template based on category
        if category == 'Coach - Cleanliness':
            return template.format(
                location=random.choice(['toilet', 'washroom', 'floor', 'seat', 'compartment']),
                coach_num=random.choice(['A1', 'B2', 'S3', 'D4']),
                cleanliness_issue=random.choice(['very dirty', 'filthy', 'unhygienic', 'unclean']),
                consequence=random.choice(['smells terrible', 'is unusable', 'causes discomfort', 'needs cleaning']),
                item=random.choice(['garbage', 'rats', 'cockroaches', 'stains']),
                adjective=random.choice(['disgusting', 'unacceptable', 'very bad']),
                action=random.choice(['immediate cleaning', 'sanitization', 'pest control']),
                problem=random.choice(['waste', 'dirt', 'litter', 'trash']),
                pests=random.choice(['cockroaches', 'rats', 'insects', 'bugs']),
                issue=random.choice(['health hazards', 'discomfort', 'disturbance']),
                surface=random.choice(['floor', 'seat', 'wall', 'window']),
                dirt_type=random.choice(['stains', 'grime', 'oil marks', 'dust']),
                condition=random.choice(['impossible', 'difficult', 'uncomfortable']),
            )
        
        elif category == 'Catering':
            return template.format(
                food_item=random.choice(['meal', 'tea', 'breakfast', 'food', 'snack']),
                quality_issue=random.choice(['stale', 'cold', 'spoiled', 'low quality']),
                problem=random.choice(['bad smell', 'insects', 'dirt', 'foreign objects']),
                adjective=random.choice(['very poor', 'terrible', 'unacceptable']),
                taste_issue=random.choice(['awful', 'bland', 'rotten', 'strange']),
                staff_type=random.choice(['vendor', 'pantry staff', 'catering attendant']),
                behavior_issue=random.choice(['very rude', 'uncooperative', 'aggressive']),
                food_problem=random.choice(['quality', 'hygiene', 'pricing']),
                price_issue=random.choice(['overcharged', 'double price', 'excessive amount']),
                complaint=random.choice(['unfair', 'wrong', 'unacceptable']),
                contaminant=random.choice(['hair', 'plastic', 'insects', 'dirt']),
                safety_issue=random.choice(['unhygienic', 'unsafe to eat', 'contaminated']),
            )
        
        elif category == 'Security':
            return template.format(
                item=random.choice(['bag', 'wallet', 'phone', 'laptop', 'luggage']),
                security_incident=random.choice(['stolen', 'snatched', 'missing', 'taken']),
                location=random.choice(['overhead rack', 'seat', 'under berth', 'coach']),
                activity=random.choice(['sleeping', 'using washroom', 'away', 'distracted']),
                security_personnel=random.choice(['RPF', 'security guard', 'police']),
                need=random.choice(['safety', 'security', 'protection']),
                harassment_type=random.choice(['harassment', 'threats', 'misbehavior', 'intimidation']),
                perpetrator=random.choice(['co-passengers', 'strangers', 'unknown persons']),
                criminal_act=random.choice(['attempted theft', 'pickpocketing', 'robbery']),
                help_type=random.choice(['police help', 'security assistance', 'protection']),
                person_type=random.choice(['people', 'vendors', 'beggars', 'individuals']),
                illegal_activity=random.choice(['smoking', 'drinking', 'gambling', 'harassing passengers']),
                problem=random.choice(['nuisance', 'disturbance', 'unsafe environment']),
            )
        
        elif category == 'Electrical Equipment':
            return template.format(
                electrical_item=random.choice(['light', 'fan', 'AC', 'charging point']),
                malfunction_type=random.choice(['not working', 'broken', 'malfunctioning', 'faulty']),
                consequence=random.choice(['very hot inside', 'cannot see', 'very uncomfortable', 'causing problems']),
                utility=random.choice(['electricity', 'power', 'lighting']),
                location=random.choice(['coach', 'compartment', 'my berth']),
                condition=random.choice(['very dark', 'unbearable', 'uncomfortable']),
                device=random.choice(['fan', 'light', 'AC unit', 'switch']),
                problem_type=random.choice(['sparking', 'not functioning', 'broken', 'damaged']),
                action=random.choice(['urgent repair', 'replacement', 'fixing']),
                component=random.choice(['wiring', 'socket', 'panel', 'circuit']),
                issue=random.choice(['exposed', 'sparking', 'damaged']),
                safety_concern=random.choice(['fire hazard', 'shock risk', 'danger']),
                charging_point=random.choice(['socket', 'charging port', 'power outlet']),
                status=random.choice(['not working', 'broken', 'dead']),
            )
        
        elif category == 'Water Availability':
            return template.format(
                water_type=random.choice(['water', 'drinking water', 'clean water']),
                location=random.choice(['washroom', 'coach', 'toilet', 'basin']),
                duration=random.choice(['hours', 'the entire journey', 'a long time']),
                issue=random.choice(['not working', 'broken', 'leaking', 'blocked']),
                consequence=random.choice(['cannot wash hands', 'very inconvenient', 'causing problems']),
                quality_issue=random.choice(['dirty', 'contaminated', 'foul smelling']),
                condition=random.choice(['muddy', 'brown', 'unclear', 'polluted']),
                water_source=random.choice(['tap', 'water supply', 'tank']),
                problem=random.choice(['empty', 'not filled', 'dry']),
                time=random.choice(['morning', 'last station', 'departure']),
                flow_issue=random.choice(['not coming', 'very slow', 'not flowing']),
                usability=random.choice(['unusable', 'difficult to use', 'impossible']),
            )
        
        elif category == 'Punctuality':
            return template.format(
                delay_duration=random.choice(['3 hours', '5 hours', 'many hours', 'severely']),
                communication=random.choice(['announcement', 'information', 'explanation', 'notice']),
                schedule_issue=random.choice(['skipped my station', 'departed early', 'changed route']),
                consequence=random.choice(['missed my stop', 'missed connection', 'got delayed']),
                information_type=random.choice(['announcement', 'update', 'notification']),
                delay_issue=random.choice(['delay', 'late arrival', 'schedule change']),
                arrival_issue=random.choice(['arrived very late', 'is moving slowly', 'stopped unexpectedly']),
                problem=random.choice(['miss their plans', 'get delayed', 'face problems']),
                delay_reason=random.choice(['technical issues', 'unknown reasons', 'poor management']),
                duration=random.choice(['several hours', '4 hours', 'too long']),
            )
        
        elif category == 'Medical Assistance':
            return template.format(
                medical_emergency=random.choice(['collapsed', 'fainted', 'fell sick', 'is unwell']),
                help_type=random.choice(['medical attention', 'doctor', 'first aid', 'ambulance']),
                health_issue=random.choice(['heart attack', 'breathing problem', 'severe pain', 'seizure']),
                medical_need=random.choice(['immediate doctor', 'medication', 'hospital admission']),
                requirement=random.choice(['assistance', 'help', 'support', 'care']),
                patient_type=random.choice(['elderly passenger', 'child', 'pregnant woman', 'sick person']),
                medical_facility=random.choice(['first aid kit', 'doctor', 'medical help']),
                emergency=random.choice(['this crisis', 'emergency situation', 'critical time']),
                person=random.choice(['passenger', 'traveler', 'co-passenger']),
                medical_intervention=random.choice(['oxygen', 'medicine', 'emergency care']),
                purpose=random.choice(['save their life', 'prevent complications', 'provide relief']),
            )
        
        # Default for other categories
        return template.format(**{k: 'issue' for k in re.findall(r'{(\w+)}', template)})
    
    def augment_complaint(self, complaint: str, category: str, labels: Dict, method: str = 'random') -> str:
        """Augment a single complaint using specified method"""
        if method == 'synonym':
            return self.paraphrase_synonym_replacement(complaint, random.randint(2, 4))
        elif method == 'restructure':
            return self.paraphrase_sentence_restructure(complaint)
        elif method == 'backtranslate':
            return self.back_translate(complaint)
        elif method == 'template':
            generated = self.generate_from_template(category, labels)
            return generated if generated else complaint
        elif method == 'random':
            chosen_method = random.choice(['synonym', 'restructure', 'template'])
            return self.augment_complaint(complaint, category, labels, chosen_method)
        else:
            return complaint
    
    def balance_and_augment(self, df: pd.DataFrame, target_per_class: int = 300, 
                           target_total: int = 5000) -> pd.DataFrame:
        """
        Balance dataset and augment to reach target sizes
        
        Args:
            df: Original dataframe
            target_per_class: Minimum samples per class
            target_total: Target total dataset size
        
        Returns:
            Augmented and balanced dataframe
        """
        print("\n" + "="*70)
        print("DATA AUGMENTATION PROCESS")
        print("="*70)
        
        # Analyze current distribution
        print("\n📊 ORIGINAL DATASET:")
        print(f"Total samples: {len(df)}")
        print(f"\nCategory distribution:")
        print(df['Category'].value_counts())
        
        augmented_rows = []
        
        # Process each category
        for category in df['Category'].unique():
            category_df = df[df['Category'] == category]
            current_count = len(category_df)
            
            print(f"\n🔧 Processing '{category}': {current_count} → {target_per_class} samples")
            
            # Add original samples
            augmented_rows.extend(category_df.to_dict('records'))
            
            # Calculate how many to generate
            needed = max(0, target_per_class - current_count)
            
            if needed > 0:
                # Augmentation strategy
                methods = ['synonym', 'restructure', 'template', 'synonym', 'restructure']
                
                for i in range(needed):
                    # Pick a random original sample to augment
                    source_row = category_df.sample(1).iloc[0]
                    method = random.choice(methods)
                    
                    # Create augmented version
                    new_complaint = self.augment_complaint(
                        source_row['Complaint Description'],
                        source_row['Category'],
                        source_row.to_dict(),
                        method=method
                    )
                    
                    # Create new row with same labels
                    new_row = source_row.to_dict()
                    new_row['Complaint Description'] = new_complaint
                    augmented_rows.append(new_row)
                    
                    if (i + 1) % 50 == 0:
                        print(f"  ✓ Generated {i + 1}/{needed} samples")
                
                print(f"  ✅ Completed: Generated {needed} new samples")
        
        # Create augmented dataframe
        augmented_df = pd.DataFrame(augmented_rows)
        
        # Shuffle
        augmented_df = augmented_df.sample(frac=1, random_state=self.seed).reset_index(drop=True)
        
        # Limit to target total if needed
        if len(augmented_df) > target_total:
            augmented_df = augmented_df.sample(n=target_total, random_state=self.seed)
        
        print("\n" + "="*70)
        print("✅ AUGMENTATION COMPLETE")
        print("="*70)
        print(f"\n📈 FINAL DATASET:")
        print(f"Total samples: {len(augmented_df)}")
        print(f"\nCategory distribution:")
        print(augmented_df['Category'].value_counts())
        print(f"\nStaff distribution:")
        print(augmented_df['Staff Assignment'].value_counts())
        print(f"\nPriority distribution:")
        print(augmented_df['Auto Priority'].value_counts())
        print(f"\nSeverity distribution:")
        print(augmented_df['Auto Severity'].value_counts())
        
        return augmented_df


def main():
    """Main augmentation script"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Augment railway complaint dataset')
    parser.add_argument('--input', type=str, required=True, help='Input CSV file')
    parser.add_argument('--output', type=str, required=True, help='Output CSV file')
    parser.add_argument('--target-per-class', type=int, default=300, 
                       help='Minimum samples per class (default: 300)')
    parser.add_argument('--target-total', type=int, default=5000,
                       help='Target total samples (default: 5000)')
    parser.add_argument('--seed', type=int, default=42, help='Random seed')
    
    args = parser.parse_args()
    
    # Load data
    print(f"📂 Loading data from: {args.input}")
    df = pd.read_csv(args.input)
    
    # Initialize augmenter
    augmenter = ComplaintAugmenter(seed=args.seed)
    
    # Augment
    augmented_df = augmenter.balance_and_augment(
        df, 
        target_per_class=args.target_per_class,
        target_total=args.target_total
    )
    
    # Save
    print(f"\n💾 Saving augmented dataset to: {args.output}")
    augmented_df.to_csv(args.output, index=False)
    print("✅ Done!")


if __name__ == '__main__':
    main()
