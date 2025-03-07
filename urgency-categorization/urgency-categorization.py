from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, TrainingArguments, Trainer
from datasets import Dataset
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import torch
import torch.nn.functional as F

descriptions = [
    "Massive pothole on Bishan Road causing accidents daily.",
    "Car on fire at Tampines Expressway, traffic jam building up.",
    "Fallen tree blocking Bukit Timah Road, vehicles stranded.",
    "Severe flooding at Bedok North, water levels rising rapidly.",
    "Gas leak at Ang Mo Kio Ave 3, strong odor detected.",
    "Live electrical wires dangling at Clementi Ave 5.",
    "Collapsed wall at Toa Payoh HDB block, debris on road.",
    "Multi-vehicle accident at Jurong West, injuries reported.",
    "Sinkhole forming at Serangoon Central, road caving in.",
    "Warehouse fire in Woodlands, flames visible from afar.",
    "Oil spill on PIE, vehicles skidding off-road.",
    "Crane collapse at Marina Bay construction site, workers trapped.",
    "Burst water main at Yishun Ring Road, flooding streets.",
    "Landslide at Bukit Batok Nature Park, paths blocked.",
    "Explosion at Changi Business Park, smoke billowing.",
    "Fallen power lines at Pasir Ris Drive 1, sparks flying.",
    "Cracked building facade at Tiong Bahru, risk of collapse.",
    "Bus-motorcycle collision at Orchard Road, traffic halted.",
    "Chemical spill at Tuas Industrial Area, toxic fumes.",
    "Scaffolding collapse at Punggol construction site, workers injured.",
    "Flooding at Kallang Basin, water entering homes.",
    "Car crashed into lamp post at Bedok South, driver unconscious.",
    "Fallen billboard at Marina Bay Sands, blocking pedestrians.",
    "Structural damage at Hougang HDB block, residents evacuated.",
    "Hawker centre fire in Geylang, multiple stalls engulfed.",
    "Fallen tree branch at East Coast Park, blocking cycling path.",
    "Leaking gas cylinder at Jurong East coffee shop.",
    "Construction debris hitting parked cars at Sengkang.",
    "Flooding at MacPherson, water entering ground-floor units.",
    "Fallen signboard at Woodlands Checkpoint, blocking entrance.",
    "Overturned vehicle at Bukit Panjang, driver trapped.",
    "Scaffolding collapse at Bishan construction site, road blocked.",
    "Residential fire in Tampines, flames spreading to adjacent units.",
    "Fallen tree at Pasir Ris Park, blocking main entrance.",
    "Flooding at Serangoon North, water levels rising.",
    "Fallen power lines at Yio Chu Kang, sparks flying.",
    "Gas leak at Clementi restaurant, strong odor.",
    "Debris from HDB block hitting cars at Toa Payoh.",
    "Multi-vehicle accident on PIE, injuries reported.",
    "Fallen tree at Bukit Timah Nature Reserve, trail blocked.",
    "Warehouse fire in Tuas, flames visible from afar.",
    "Scaffolding collapse at Jurong East site, workers injured.",
    "Flooding at Bedok Reservoir, water entering homes.",
    "Fallen billboard at Orchard Road, blocking walkway.",
    "Fallen tree at East Coast Park, cycling path blocked.",
    "Leaking gas cylinder at Ang Mo Kio coffee shop.",
    "Construction debris hitting cars at Punggol.",
    "Flooding at Kallang Basin, ground-floor units flooded.",
    "Fallen signboard at Woodlands Checkpoint, entrance blocked.",
    "Overturned vehicle at Bukit Panjang, driver trapped.",
    "Major landslide at Bukit Timah Nature Reserve, paths blocked.",
    "Explosion at Changi Business Park, smoke billowing.",
    "Crane collapse at Marina Bay construction site, workers trapped.",
    "Burst water main at Yishun Ring Road, flooding streets.",
    "Chemical spill at Tuas Industrial Area, toxic fumes reported.",
    "Structural cracks in Hougang HDB block, evacuation ordered.",
    "Bus-motorcycle collision at Orchard Road, traffic halted.",
    "Fallen billboard at Marina Bay Sands, pedestrians at risk.",
    "Fire spreading in Tampines residential flats, residents fleeing.",
    "Oil spill on PIE, vehicles skidding off-road.",
    "Gas explosion at Jurong East factory, flames visible.",
    "Collapsed bridge at Sengkang, emergency crews dispatched.",
    "Train derailment at Bishan MRT, passengers stranded.",
    "Toxic fumes from burning chemicals at Tuas.",
    "Major landslide at MacRitchie Reservoir, trails closed.",
    "Building collapse at Tampines, rescue operations underway.",
    "High-voltage electrical fire at Pasir Ris substation.",
    "Flooding at Changi Airport, runways temporarily closed.",
    "Factory explosion at Woodlands, nearby homes evacuated.",
    "Overturned tanker on AYE, hazardous material leak.",
    "Major accident on CTE, lanes blocked.",
    "Fire at Tuas Power Plant, blackouts reported.",
    "Collapsed tunnel at Jurong East MRT.",
    "Radiation leak at industrial site in Punggol.",
    "Tsunami warning for East Coast Park.",
    "Terrorist attack at Marina Bay Sands, lockdown enforced.",
    "Hostage situation at Orchard Road mall.",
    "Major earthquake damage in Bishan.",
    "Biological hazard detected at Changi Airport.",
    "Riot at Little India, crowd control activated.",
    "Cyberattack on critical infrastructure.",
    "Major gas pipeline rupture at Bukit Panjang.",
    "Nuclear facility emergency in Tuas.",
    "Airplane crash near Changi.",
    "Mass transit system failure islandwide.",
    "Severe storm surge at East Coast.",
    "Volcanic ash cloud affecting air travel.",
    "Major dam breach at MacRitchie.",
    "Epidemic outbreak in Tampines.",
    "Bomb threat at Raffles Place.",
    "Major bridge collapse at Kallang.",
    "Toxic algae bloom in Bedok Reservoir.",
    "Major refinery fire at Jurong Island.",
    "Subway tunnel flooding at City Hall.",
    "Hostage crisis at Sentosa resort.",
    "Major landslide at Sentosa Cove.",
    "Severe air pollution crisis (PSI 300+).",
    "Major cyberattack on healthcare systems.",
    "Nuclear submarine incident at Changi Naval Base.",
    "Islandwide power grid failure.",
    "Medium Urgency (100 examples)",
    "Streetlight outage at Bedok North Ave 3, dark at night.",
    "Loud construction noise at Jurong East disturbing residents.",
    "Broken traffic light at Tampines Ave 5 causing delays.",
    "Overflowing rubbish bin at Clementi Ave 2, pest issue.",
    "Flickering streetlamp at Yishun Ring Road.",
    "Noisy karaoke at Ang Mo Kio HDB block.",
    "Broken bench at Bishan Park.",
    "Overgrown grass at Pasir Ris Park.",
    "Leaking aircon unit at Toa Payoh HDB block.",
    "Loud party music at Marine Parade.",
    "Broken playground equipment at Sengkang.",
    "Pothole forming at Bukit Batok West Ave 6.",
    "Loud drilling noise at Punggol construction site.",
    "Fallen branches blocking part of East Coast Park path.",
    "Broken water fountain at Jurong Lake Gardens.",
    "Barking dog disturbance at Hougang Ave 10.",
    "Faulty pedestrian crossing light at Tiong Bahru.",
    "Overflowing drain at Bedok Reservoir.",
    "Renovation noise complaint at Kallang Bahru.",
    "Damaged playground swings at Woodlands.",
    "Fallen tree branch at Pasir Ris Park.",
    "Loud car music at Orchard Road.",
    "Broken fence at Bishan Park.",
    "Overflowing rubbish bin at Yishun Ave 11.",
    "Flickering streetlamp at Clementi Ave 3.",
    "Noisy construction work at Sengkang.",
    "Broken bench at East Coast Park.",
    "Overgrown bushes at Jurong East.",
    "Leaking pipe at Tampines HDB block.",
    "Loud party music at Serangoon.",
    "Broken playground slide at Punggol.",
    "Pothole forming at Ang Mo Kio Ave 8.",
    "Loud drilling noise at Bukit Batok construction site.",
    "Fallen branches blocking part of Bedok Reservoir path.",
    "Broken water fountain at Bishan Park.",
    "Barking dog disturbance at Clementi Ave 4.",
    "Faulty pedestrian crossing light at Woodlands.",
    "Overflowing drain at Yishun.",
    "Renovation noise complaint at Hougang.",
    "Damaged swings at Jurong East playground.",
    "Fallen tree branch at East Coast Park.",
    "Loud car music at Marina Bay.",
    "Broken fence at Pasir Ris Park.",
    "Overflowing rubbish bin at Tampines Ave 9.",
    "Flickering streetlamp at Bukit Batok West Ave 8.",
    "Noisy construction work at Punggol.",
    "Broken bench at Jurong Lake Gardens.",
    "Overgrown bushes at Bedok.",
    "Leaking pipe at Sengkang HDB block.",
    "Loud party music at Ang Mo Kio.",
    "Pothole forming at Marine Parade.",
    "Fallen branches blocking part of MacPherson Park.",
    "Broken water fountain at Tampines Park.",
    "Barking dog disturbance at Jurong West.",
    "Faulty pedestrian crossing light at Clementi.",
    "Overflowing drain at Hougang.",
    "Renovation noise complaint at Bedok.",
    "Damaged swings at Sengkang playground.",
    "Fallen tree branch at Bukit Timah Park.",
    "Loud car music at Sentosa.",
    "Broken fence at East Coast Park.",
    "Overflowing rubbish bin at Serangoon.",
    "Flickering streetlamp at Ang Mo Kio Ave 10.",
    "Noisy construction work at Choa Chu Kang.",
    "Broken bench at Pasir Ris Park.",
    "Overgrown bushes at Tampines.",
    "Leaking pipe at Jurong West HDB block.",
    "Loud party music at Punggol.",
    "Broken playground slide at Hougang.",
    "Pothole forming at Clementi Ave 6.",
    "Fallen branches blocking part of Bishan Park.",
    "Broken water fountain at Woodlands Park.",
    "Barking dog disturbance at Tampines.",
    "Faulty pedestrian crossing light at Yishun.",
    "Overflowing drain at Ang Mo Kio.",
    "Renovation noise complaint at Sembawang.",
    "Damaged swings at Jurong West playground.",
    "Fallen tree branch at MacPherson Park.",
    "Loud car music at Jurong East.",
    "Broken fence at Bishan Park.",
    "Overflowing rubbish bin at Clementi.",
    "Flickering streetlamp at Tampines Ave 7.",
    "Noisy construction work at Bedok.",
    "Broken bench at Hougang Park.",
    "Overgrown bushes at Yishun.",
    "Leaking pipe at Pasir Ris HDB block.",
    "Loud party music at Woodlands.",
    "Broken playground slide at Ang Mo Kio.",
    "Pothole forming at Jurong East Ave 5.",
    "Fallen branches blocking part of Sengkang Park.",
    "Broken water fountain at Punggol Park.",
    "Barking dog disturbance at Marine Parade.",
    "Faulty pedestrian crossing light at Bukit Batok.",
    "Overflowing drain at Clementi.",
    "Renovation noise complaint at Tampines.",
    "Damaged swings at Sembawang playground.",
    "Fallen tree branch at Jurong Lake Gardens.",
    "Loud car music at Choa Chu Kang.",
    "Broken fence at MacPherson Park.",
    "Overflowing rubbish bin at Hougang.",
    "Low Urgency (100 examples)",
    "Graffiti on Clementi HDB wall, needs cleaning.",
    "Stray cat roaming Yishun Park.",
    "Faded road markings at Bedok North.",
    "Litter scattered at Pasir Ris Park.",
    "Peeling paint on Bishan Park benches.",
    "Overgrown grass at Jurong East.",
    "Broken vending machine at Tampines MRT.",
    "Cracked pavement at Toa Payoh.",
    "Bird droppings on East Coast Park benches.",
    "Flickering neon sign at Geylang.",
    "Old newspapers piled at Hougang void deck.",
    "Loose railing at Serangoon staircase.",
    "Fallen leaves blocking MacPherson walkway.",
    "Faded mural at Orchard Road.",
    "Stray chickens near Yishun flats.",
    "Broken clock at Jurong bus stop.",
    "Dusty notice board at Ang Mo Kio.",
    "Squeaky gate at Tampines Park.",
    "Cobwebs at Bukit Batok shelter.",
    "Tilted lamp post at Clementi.",
    "Peeling posters at Paya Lebar.",
    "Small puddle at Hougang MRT entrance.",
    "Graffiti at Woodlands HDB block.",
    "Stray dog at Bedok Reservoir.",
    "Faded road markings at Tampines.",
    "Litter at Jurong Lake Gardens.",
    "Peeling bench paint at Pasir Ris Park.",
    "Overgrown grass at Sengkang.",
    "Broken vending machine at Bishan MRT.",
    "Cracked pavement at Serangoon.",
    "Bird droppings at Bedok Reservoir benches.",
    "Flickering neon sign at Little India.",
    "Old newspapers at Tampines void deck.",
    "Loose railing at Punggol staircase.",
    "Fallen leaves blocking Yishun walkway.",
    "Faded mural at Marina Bay.",
    "Stray chickens near Bedok flats.",
    "Broken clock at Ang Mo Kio bus stop.",
    "Dusty notice board at Clementi.",
    "Squeaky gate at Jurong East Park.",
    "Cobwebs at Pasir Ris shelter.",
    "Tilted lamp post at Woodlands.",
    "Peeling posters at Hougang.",
    "Small puddle at Tampines MRT entrance.",
    "Graffiti at Pasir Ris HDB block.",
    "Stray cat at Jurong West Park.",
    "Faded road markings at Ang Mo Kio.",
    "Litter at Bishan Park.",
    "Peeling bench paint at East Coast Park.",
    "Overgrown grass at MacPherson.",
    "Broken vending machine at Serangoon MRT.",
    "Cracked pavement at Hougang.",
    "Bird droppings at Tampines Park benches.",
    "Flickering neon sign at Clarke Quay.",
    "Old newspapers at Punggol void deck.",
    "Loose railing at Woodlands staircase.",
    "Fallen leaves blocking Jurong East walkway.",
    "Faded mural at Gardens by the Bay.",
    "Stray chickens near Sengkang flats.",
    "Broken clock at Jurong West bus stop.",
    "Dusty notice board at Pasir Ris.",
    "Squeaky gate at Bishan Park.",
    "Cobwebs at Hougang shelter.",
    "Tilted lamp post at Ang Mo Kio.",
    "Peeling posters at Tampines.",
    "Small puddle at Jurong East MRT entrance.",
    "Graffiti at Sembawang HDB block.",
    "Stray cat at MacPherson Park.",
    "Faded road markings at Clementi.",
    "Litter at Pasir Ris Park.",
    "Peeling bench paint at Yishun Park."
]

print(len(descriptions))
categories = (
    ["High Urgency"] * 100 +
    ["Medium Urgency"] * 100 +
    ["Low Urgency"] * 73
)
# Verify lengths match
assert len(descriptions) == len(categories) == 273, "Mismatch in number of descriptions and categories"

print("All descriptions and categories are correctly set up.")


# Initialize tokenizer
tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')

# Map categories to labels
category_to_label = {category: idx for idx, category in enumerate(set(categories))}
labels = [category_to_label[category] for category in categories]

# Stratified split
train_desc, eval_desc, train_labels, eval_labels = train_test_split(
    descriptions, labels, test_size=0.2, random_state=42, stratify=labels
)

# Tokenize
train_encodings = tokenizer(train_desc, truncation=True, padding=True, return_tensors='pt')
eval_encodings = tokenizer(eval_desc, truncation=True, padding=True, return_tensors='pt')

# Create datasets
train_dataset = Dataset.from_dict({
    'input_ids': train_encodings['input_ids'],
    'attention_mask': train_encodings['attention_mask'],
    'labels': torch.tensor(train_labels)
})
eval_dataset = Dataset.from_dict({
    'input_ids': eval_encodings['input_ids'],
    'attention_mask': eval_encodings['attention_mask'],
    'labels': torch.tensor(eval_labels)
})

# Model setup
num_labels = len(set(categories))  # 3
model = DistilBertForSequenceClassification.from_pretrained('distilbert-base-uncased', num_labels=num_labels)

# Define metrics function
def compute_metrics(pred):
    labels = pred.label_ids
    preds = pred.predictions.argmax(-1)
    acc = accuracy_score(labels, preds)
    return {"accuracy": acc}

# Adjusted training arguments
training_args = TrainingArguments(
    output_dir='./results',
    num_train_epochs=10,              # Reduced to prevent overfitting
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    warmup_steps=5,
    weight_decay=0.01,
    logging_dir='./logs',
    logging_steps=5,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    learning_rate=5e-5,             # Lowered for better fine-tuning
    metric_for_best_model="accuracy",
    greater_is_better=True
)

# Train
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    compute_metrics=compute_metrics
)
trainer.train()

# Save model and tokenizer
model.save_pretrained('./urgency_classifier_model')
tokenizer.save_pretrained('./urgency_classifier_model')

# Classification functions
def classify_issue(description):
    inputs = tokenizer(description, return_tensors='pt', truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    probabilities = F.softmax(outputs.logits, dim=-1)
    predicted_label = probabilities.argmax().item()
    confidence = probabilities[0][predicted_label].item()
    label_to_category = {v: k for k, v in category_to_label.items()}
    return label_to_category[predicted_label], confidence

def classify_with_threshold(description, threshold=0.8):
    category, confidence = classify_issue(description)
    if confidence >= threshold:
        print(f"{description}: Assigned category: {category}, Confidence: {confidence:.2f}")
        return category, confidence
    else:
        print(f"{description}: Suggested category: {category} with low confidence ({confidence:.2f}). Please select manually.")
        return "Uncertain", confidence

# Test function (improved)
def test_model():
    while True:
        desc = input("Testing NLP (type 'stop' to exit): ")
        if desc.lower() == "stop":
            break
        classify_with_threshold(desc)

# Run the test
test_model()
