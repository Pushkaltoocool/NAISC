from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, TrainingArguments, Trainer
from datasets import Dataset
from sklearn.model_selection import train_test_split
import torch
import torch.nn.functional as F


# Define the dataset with 20 examples per category
descriptions = [
    # Pothole (20 examples)
    "There’s a big lah, pothole on Orchard Road near Somerset MRT, damn jialat sia.",
    "A huge hole on Bukit Timah Road lah, spoil my car tire already.",
    "The pavement at Jurong East Ave 1 got one deep pothole, nearly trip sia.",
    "I hit a pothole on Tampines Street 21 last night—danger lah, so dark some more.",
    "Got a crater-like pothole at the corner of Serangoon Road and Rangoon Road, siao liao.",
    "Big hole on Woodlands Ave 7 lah, causing flat tires, must fix lah.",
    "The road at Bedok North Ave 3 got pothole lah, so bumpy until my head pain sia.",
    "Pothole near the bus stop at Boon Lay Way lah, people complain liao still never repair.",
    "A massive hole on Changi Road lah, motorbike nearly langgar sia.",
    "Pothole outside the HDB at Hougang Ave 8, every day also got car kena stuck lah.",
    "Noticed a deep pothole on Jalan Bukit Merah, really jialat lah, nearly wreck my car.",
    "The lane at Eunos Crescent got a pothole, making the ride super rough, confirm shiok pain.",
    "Pothole on Clementi Road, so bad until my suspension got whack, cannot tahan lah.",
    "Spotted a pothole near the shopping mall in Choa Chu Kang, disturb my drive lah.",
    "There’s a gnarly pothole at Sengkang East Way, must fix quick or risk accident lah.",
    "Saw a pothole at Queenstown Rd, very huge and dangerous, really siao lah.",
    "The street near Ang Mo Kio Town Centre got pothole, bumpy ride until headache, damn lah.",
    "Pothole spotted on Jalan Eunos, really deep one, nearly buat my tyre burst lah.",
    "At Pasir Ris, found a pothole by the park, now people afraid to drive lah.",
    "Deep pothole on the side of Clementi Ave 3, so reckless lah, need repair ASAP.",

    # Street Light Outage (20 examples)
    "The street light outside my HDB in Bedok lah, two days never work already.",
    "Street lamp on Ang Mo Kio Ave 3 totally out, pitch black sia.",
    "No light along Yishun Ring Road since last week, so creepy lah.",
    "The streetlight at Toa Payoh Lorong 6 keep flickering then mati liao.",
    "Broken street light on Pasir Ris Drive 1 lah, night time so dark lah.",
    "Streetlights along Choa Chu Kang Ave 4 all down, cannot see anything sia.",
    "The lamp at Clementi Ave 5 lah, spoil already, walk home so scary sia.",
    "No street light at Jurong West St 41 lah, kids play there also cannot see.",
    "Streetlight near Sengkang MRT keep blinking lah, then now totally off sia.",
    "Whole stretch of Marine Drive got no lights lah, like haunted place sia.",
    "Street light at Paya Lebar Road out for days, leave the area pitch black lah.",
    "Lamp outside my block in Boon Lay never turn on, so worrying lah.",
    "No street lamp on Tiong Bahru Road, the area so dark, confirm scary sia.",
    "The lamp at Bedok South Ave 3 is down, now whole street like ghost town lah.",
    "Street light at Yio Chu Kang got blackout, disturb my evening walk, damn sia.",
    "The street lamps along Sembawang Road, all out, driving becomes dangerous lah.",
    "Lamp near Jurong East MRT not working, everyone complain, really standard lah.",
    "Broken light on Woodlands Street, so dark that even cats can't see, sial.",
    "Street light in Punggol sometimes work then suddenly out, confirm annoying lah.",
    "No functioning lamp at Clementi Road, area completely dark, must replace lah.",

    # Graffiti (20 examples)
    "Got offensive graffiti lah, painted on the void deck wall at Clementi HDB.",
    "Someone spray-paint sia, rude words on the bench at Bishan Park.",
    "Graffiti all over the shop wall at Bugis Street, so ugly lah.",
    "Vandalism with paint on the school fence at Hougang lah, need to clean sia.",
    "The underpass near Lavender MRT kena tagged with colorful graffiti liao.",
    "Spray paint spoil the bus stop at Punggol Road, knn lah, who do this?",
    "Got graffiti on the wall at Tiong Bahru market lah, so sia suay lah.",
    "Someone draw nonsense on the HDB staircase at Woodlands lah, damn irritating sia.",
    "The playground at Tampines lah, kena spray paint all over, kids scared sia.",
    "Graffiti on the bridge near Kallang River lah, so messy until cannot tahan.",
    "Offensive spray on the MRT station wall at Jurong East, really standard lah.",
    "Graffiti tagged on the wall outside the coffee shop in Ang Mo Kio, very shameless sia.",
    "Someone scribbled vulgar words on the community centre at Paya Lebar, damn lah.",
    "Graffiti on the back of a bus stop in Yishun, so annoying lah, need clean up.",
    "Ugly tags on the fence at Serangoon Plaza, really spoil the view lah.",
    "Random graffiti on the wall of a hawker centre in Bedok, disturb the ambiance sia.",
    "Tagging on the mural at Toa Payoh, so childish but messy lah.",
    "Someone sprayed a crude message on the wall at Sengkang, damn offensive sia.",
    "Vandalised paint on the wall outside a wet market in Little India, really unsightly lah.",
    "Graffiti on the staircase of an HDB block in Bishan, so disrespectful lah.",

    # Abandoned Vehicle (20 examples)
    "One car lah, left at Jalan Besar carpark for over a month already.",
    "Old truck parked and abandoned at Sengkang East Way, so long lah.",
    "Got a rusty van sitting at Geylang Lorong 20 for weeks sia.",
    "A broken-down sedan never move from Tiong Bahru Road, so sia suay lah.",
    "Someone abandon motorcycle at Marine Parade lah, been there forever sia.",
    "Abandoned SUV blocking the lane near Jurong West St 52, bloody hell lah.",
    "Old lorry lah, parked at Pasir Panjang Road, collecting dust sia.",
    "A beat-up car at Bukit Batok St 21 lah, nobody claim for months liao.",
    "Motorcycle kena left at the carpark near Yishun MRT lah, so messy sia.",
    "Got one taxi lah, abandoned at Serangoon Central, lah, so long never tow away.",
    "Rusty pickup truck abandoned on the side of Tampines Ave, really must clear up lah.",
    "Broken van sitting idle at Hougang Street, blocking traffic and causing delays lah.",
    "A dilapidated car parked at Ang Mo Kio exactly, nobody claim for ages sia.",
    "Abandoned motorcycle on Jurong Hill Road, been there so long until people complain lah.",
    "Old taxi left at Yio Chu Kang, create nuisance for everyone, really cannot tahan lah.",
    "Unused car at Punggol Field, left for weeks, road become obstruction lah.",
    "Rusty SUV on the verge of falling apart at Bedok North, must be towed away lah.",
    "Abandoned lorry on Sembawang Road, turning the lane into a parking lot, so messy sia.",
    "Old sedan left unattended at Clementi Central, really jam up the area lah.",
    "A forgotten mini-van on Holland Road, in the middle of the road, need immediate removal lah.",

    # Illegal Dumping (20 examples)
    "Trash bags lah, dumped at the back lane of my HDB in Queenstown sia.",
    "Piles of rubbish scattered near the canal at Sungei Kadut, so smelly lah.",
    "Someone throw old sofa at the empty lot along Commonwealth Ave lah.",
    "A heap of junk kena illegally dumped near East Coast Park entrance sia.",
    "Mattresses and trash clogging the drain at Sembawang lah, so dirty lah.",
    "Discarded tires all piled up at Kranji Road, lah, so messy sia.",
    "Rubbish bags lah, thrown near the playground at Ang Mo Kio, damn smelly lah.",
    "Old fridge and boxes dumped at Bukit Panjang lah, blocking the path sia.",
    "Someone lah, leave construction debris at Punggol Field, so inconsiderate sia.",
    "Trash lah, scattered all over the grass patch at Bedok Reservoir, lah, so jialat.",
    "Illegal dumping of cardboard boxes at Changi Business Park, really clutter the area lah.",
    "Someone dumped broken furniture at Yishun Street, so irresponsible sia.",
    "Junk piled up at Woodlands industrial area, making the place look trashy lah.",
    "Piles of old appliances dumped near Toa Payoh, disturb the neighborhood lah.",
    "Large heap of rubbish along Jurong Island, causing environmental issues, damn sia.",
    "Construction waste thrown on the side of Serangoon Road, very messy lah.",
    "Old mattresses and broken items dumped at Tampines industrial zone, so unsightly lah.",
    "Discarded electronics piled at Paya Lebar, creating a hazardous scene, really jialat lah.",
    "Someone dump food waste near the park at Bedok, smell so bad sia.",
    "Illegal waste dumped on the verge of Sembawang, polluting the view, must remove lah.",

    # Noise Complaint (20 examples)
    "My neighbor lah, play loud music every night, cannot sleep sia.",
    "Got one dog downstairs at Bukit Batok keep barking non-stop lah.",
    "Construction noise at Admiralty Road wake me up so early lah, sian.",
    "Party at the HDB flat in Redhill lah, blast music till 3 AM sia.",
    "Loud shouting from upstairs at Woodlands lah, every day also like that.",
    "Noisy renovation works at Kallang Bahru all day lah, headache sia.",
    "The neighbor at Jurong East lah, karaoke until midnight, damn noisy lah.",
    "Kids screaming and running at the void deck in Sengkang lah, so irritating sia.",
    "Got loud drilling at Choa Chu Kang lah, whole day never stop sia.",
    "Someone lah, honking car horn non-stop at Toa Payoh, knn lah, so annoying.",
    "Loud bass from the club in Clarke Quay, disturb the whole area, really so shiok noise.",
    "Constant barking from stray dogs at Yishun, disturb the peace, damn lah.",
    "Loud hammering noise at Bedok construction site, early morning disturbance, sian lah.",
    "Neighbour's flat in Ang Mo Kio always blasting rock music, make my head hurt, really noisy sia.",
    "Screeching sound from the elevator at Bishan, so loud until disturb my sleep lah.",
    "Noise from a nearby carnival at Sentosa, blaring music all night, cannot tahan lah.",
    "The constant honking from traffic near Orchard Road, so irritating, make me want to puke lah.",
    "Loud party at Hougang HDB, music blast till dawn, so disruptive lah.",
    "Unrelenting noise from a roadside stall in Jurong, disturb the neighbourhood peace, damn lah.",
    "Continuous drilling noise at Yishun industrial area, headache until cannot concentrate, really noisy lah.",

    # Other (20 examples)
    "A stray dog lah, keep barking near my block at Marsiling sia.",
    "The walkway at Bukit Panjang kena blocked by fallen tree branches lah.",
    "Got a damn smelly stench from the drain at Little India sia.",
    "A swarm of bees nesting in the tree at Sentosa Cove lah, scary sia.",
    "Leaking pipe near Kembangan MRT flooding the path lah, so wet sia.",
    "Broken glass all over the cycling path at Punggol Waterway lah, dangerous lah.",
    "Got monkey lah, stealing food near the HDB at Bukit Timah, siao liao.",
    "The lift at Bishan HDB lah, keep making weird noise sia.",
    "A big bird lah, fly into my window at Pasir Ris, now glass crack sia.",
    "Flood lah, near the market at Serangoon North, water everywhere sia.",
    "A lost parrot lah, flying around Marina Bay, causing quite the commotion sia.",
    "Overflowing manhole at Tiong Bahru, water everywhere, so messy lah.",
    "Stray cat roaming around Holland Village, give me heart attack lah.",
    "A pile of leaves blocking the walkway at MacPherson, not neat lah, need clear out.",
    "Unexpected hail at Jurong East, wet and cold, really out of place lah.",
    "A broken bench at Mountbatten Park, become hazard for the elderly lah.",
    "Wild squirrel running across the street at Pasir Ris, so funny yet dangerous lah.",
    "Pest infestation at the hawker centre in Geylang, so nasty lah, really need pest control.",
    "Water leakage from a rooftop at Serangoon, drip drip sound, annoyingly persistent lah.",
    "Fallen signboard at Woodlands, block the pathway, must be fixed quickly lah."
]

# Define the corresponding category labels (20 examples for each category)
categories = (
    ["Pothole"] * 20 +
    ["Street Light Outage"] * 20 +
    ["Graffiti"] * 20 +
    ["Abandoned Vehicle"] * 20 +
    ["Illegal Dumping"] * 20 +
    ["Noise Complaint"] * 20 +
    ["Other"] * 20
)

tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
category_to_label = {category: idx for idx, category in enumerate(set(categories))}
labels = [category_to_label[category] for category in categories]

# Stratified split to ensure balanced categories
train_desc, eval_desc, train_labels, eval_labels = train_test_split(
    descriptions, labels, test_size=0.2, random_state=42, stratify=labels
)

# Tokenize
train_encodings = tokenizer(train_desc, truncation=True, padding=True, return_tensors='pt')
eval_encodings = tokenizer(eval_desc, truncation=True, padding=True, return_tensors='pt')

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

# Step 2: Model setup
num_labels = len(set(categories))
model = DistilBertForSequenceClassification.from_pretrained('distilbert-base-uncased', num_labels=num_labels)

# Step 3: Adjusted training arguments
training_args = TrainingArguments(
    output_dir='./results',
    num_train_epochs=10,             # More epochs for better learning
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    warmup_steps=5,                 # Fewer warmup steps
    weight_decay=0.01,
    logging_dir='./logs',
    logging_steps=5,
    eval_strategy="epoch",          # Updated to avoid FutureWarning
    save_strategy="epoch",
    load_best_model_at_end=True,
    learning_rate=5e-5              # Slightly higher learning rate
)

# Step 4: Train
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset
)
trainer.train()

# Step 5: Save
model.save_pretrained('./issue_classifier_model')
tokenizer.save_pretrained('./issue_classifier_model')

# Step 6: Classification functions
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

# Step 7: Test
test_descriptions = [
]

def test_model():
    running = True
    while running:

        test2 = input("Testing NLP: ")
        if test2 == "stop":
            running = False
        else:
            test_descriptions.append(test2)
        for desc in test_descriptions:
            classify_with_threshold(desc)

test_model()



