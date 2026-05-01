export const getLessonContent = (title, subject, lessonNum = 1) => {
  // Clean title for matching (remove prefixes and subtopic suffixes)
  let cleanTitle = title.split(" - ").pop();
  if (cleanTitle.includes(": ")) {
    cleanTitle = cleanTitle.split(": ")[0];
  }

  const specificData = {
    "Two Little Hands": {
      content: "<h3><strong>Major Extension: Discovering My Body</strong></h3>\
<p>Our body is a wonderful gift. We have two hands to work and play, two feet to walk and run, and a face that shows how we feel. In this chapter, we learn that every part of our body has a special job to do. We must take care of our body and keep it clean. When we clap our hands, we are using our muscles and bones to make a happy sound! When we blink our eyes, we are protecting them and keeping them moist. Everything our body does is important.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Naming words:</strong> hand, eye, leg, face, body, fingers, toes, elbows</li>\
<li><strong>Action words:</strong> clap, blink, walk, run, smile, stamp, wave</li>\
<li><strong>Simple sentence:</strong> I can clap with my two little hands.</li>\
<li><strong>Plurals:</strong> Hand becomes hands, Eye becomes eyes.</li>\
</ul>",
      quiz: [
        { "question": "Name a body part used for seeing.", "options": ["Hands", "Feet", "Eyes", "Nose"], "answer": "Eyes" },
        { "question": "What action can we do with our hands?", "options": ["Walk", "Clap", "Blink", "Smile"], "answer": "Clap" },
        { "question": "How many hands do we have?", "options": ["One", "Two", "Three", "Four"], "answer": "Two" },
        { "question": "We use our ___ to walk.", "options": ["Ears", "Eyes", "Feet", "Nose"], "answer": "Feet" },
        { "question": "Which action word means closing and opening eyes quickly?", "options": ["Smile", "Blink", "Run", "Clap"], "answer": "Blink" },
        { "question": "We use our nose to ___.", "options": ["See", "Smell", "Hear", "Clap"], "answer": "Smell" },
        { "question": "Which of these is a naming word?", "options": ["Run", "Finger", "Jump", "Loud"], "answer": "Finger" },
        { "question": "I have ___ toes on each foot.", "options": ["Two", "Five", "Ten", "Zero"], "answer": "Five" }
      ],
      lessons: [
        { title: "My Two Hands", explanation: "We have two hands that help us do many things. We can clap, hold toys, and wave hello! Our hands have fingers and a palm. We use them to write our name, draw pictures, and eat our food. Hands are our primary tools for interacting with the world. Without hands, it would be hard to hold a spoon or a pencil. Let's appreciate our wonderful hands!", words: ["Hands", "Clap", "Hold", "Wave", "Fingers", "Palm", "Tools"], activities: "Hold a pencil and try to write your name. Feel how your fingers move!" },
        { title: "My Two Feet", explanation: "We have two feet that help us move. We can walk, run, and jump around the room. Our feet carry us everywhere! Each foot has five small toes. When we wear shoes, we protect our feet from sharp things and dirt. Feet allow us to dance, play football, and climb stairs. They are strong and help us balance our whole body when we stand up straight.", words: ["Feet", "Walk", "Run", "Jump", "Toes", "Step", "Balance"], activities: "Stand on one foot for 10 seconds. Notice how your foot works hard to keep you balanced!" },
        { title: "Seeing & Smiling", explanation: "Our eyes help us see the beautiful world around us. We can see colors, shapes, and the faces of our friends. Our face helps us show happiness with a big smile. When we are happy, our mouth curves up! We also have a nose to smell flowers and ears to hear music. All these parts together make our face special and unique.", words: ["Eyes", "See", "Face", "Smile", "Blink", "Happy", "Unique"], activities: "Look in the mirror and smile as big as you can. Point to your eyes and ears." },
        { title: "Action Words Deep-Dive", explanation: "Action words (verbs) tell us what our body is doing. Let's practice many actions! We can clap (hands), blink (eyes), walk (legs), stamp (feet), wave (arms), and wiggle (fingers). Each body part has its own set of favorite actions. When we learn these words, we can describe exactly what we are doing throughout the day. Math and English come together when we count how many times we clap!", words: ["Clap", "Blink", "Walk", "Move", "Run", "Jump", "Stamp", "Wiggle"], activities: "Do 5 claps, 5 jumps, and 5 blinks. Count them out loud while you do it!" },
        { title: "Keeping Clean & Healthy", explanation: "It is important to keep our body parts clean. We wash our hands before eating and after playing. We keep our skin healthy and neat by taking a bath every day. Cleaning our teeth makes them strong. When we take care of our body, we don't get sick often. A clean body is a happy body! Hygiene is the first step to a long and healthy life.", words: ["Wash", "Clean", "Healthy", "Body", "Soap", "Water", "Neat", "Hygiene"], activities: "Practice washing your hands with soap. Make sure to clean between your fingers too!" },
        { title: "Review: The Human Machine", explanation: "In this chapter, we learned that our body is like a wonderful machine with many parts. Each part has a name and a job. We learned naming words like 'hand' and action words like 'clap'. By keeping our body clean and using it for good things, we stay happy and strong. You are now a master of your own body parts!", words: ["Review", "Parts", "Actions", "Fun", "Body", "Health", "Care", "Machine"], activities: "Name 5 body parts and one action for each part (e.g., Eyes - Seeing)." }
      ]
    },
    "Greetings": {
      content: "<h3><strong>Main focus: Polite language and speaking to others</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter teaches children how to greet people politely. A greeting is the first kind word we say when we meet someone. Children learn words like good morning, good afternoon, and good night. They also learn that a smile and polite behaviour make people feel happy. The lesson builds good habits, because speaking politely is an important part of daily life. Children can use these words at school, at home, and with friends.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Polite words:</strong> hello, good morning, thank you, please</li>\
<li>Capital letters at the beginning of sentences</li>\
<li>Use of full stops at the end of simple sentences</li>\
<li>Talking to one person politely</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Role-play meeting a teacher, friend, or elder.</li>\
<li>Say different greetings at different times of day.</li>\
<li>Make greeting cards for family members.</li>\
</ul>",
      quiz: [{ "question": "What do you say in the morning?", "options": ["Good night", "Good afternoon", "Good morning", "Goodbye"], "answer": "Good morning" }, { "question": "Which of the following is a polite word?", "options": ["Run", "Please", "Jump", "Loud"], "answer": "Please" }],
      lessons: [
        { title: "Morning Greetings", explanation: "When we wake up and see our parents or teachers, we say 'Good Morning' with a big smile!", words: ["Good", "Morning", "Smile", "Wake up"] },
        { title: "Afternoon & Night", explanation: "As the day changes, our greetings change too. We say 'Good Afternoon', 'Good Evening', and 'Good Night' before sleep.", words: ["Afternoon", "Evening", "Night", "Sleep"] },
        { title: "Polite Words", explanation: "Being polite makes everyone happy. We say 'Please' when we want something and 'Thank You' when we get it.", words: ["Please", "Thank you", "Happy", "Polite"] },
        { title: "Sorry & Excuse Me", explanation: "If we make a mistake, we say 'Sorry'. If we want to pass or talk, we say 'Excuse Me'.", words: ["Sorry", "Mistake", "Excuse me", "Manners"] },
        { title: "Meeting Friends", explanation: "When we meet a friend, we say 'Hello' or 'Hi'. It is a friendly way to start a talk.", words: ["Hello", "Hi", "Friend", "Talk"] },
        { title: "Review: Manners", explanation: "Manners are important! Using kind words shows that we are good children.", words: ["Manners", "Kind", "Words", "Respect"] }
      ]
    },

    "My Body and Sense Organs": {
      content: "<h3><strong>Major Extension: Our Five Windows to the World</strong></h3>\
<p>Sense organs are the parts of our body that help us know what is happening around us. We have five main sense organs: <strong>Eyes, Ears, Nose, Tongue, and Skin</strong>. They are like windows that let information into our brain. Without our senses, we wouldn't know if a flower smells sweet or if a bell is ringing. Learning about sense organs helps us understand how we interact with the world.</p>\
<h3><strong>The Five Senses:</strong></h3>\
<ul>\
<li><strong>Sight (Eyes):</strong> To see colors, shapes, and distance.</li>\
<li><strong>Hearing (Ears):</strong> To hear loud and soft sounds.</li>\
<li><strong>Smell (Nose):</strong> To smell perfumes or smoke.</li>\
<li><strong>Taste (Tongue):</strong> To taste sweet, sour, salty, and bitter.</li>\
<li><strong>Touch (Skin):</strong> To feel hot, cold, soft, or hard things.</li>\
</ul>",
      quiz: [
        { "question": "Which sense organ helps us taste food?", "options": ["Nose", "Tongue", "Skin", "Eyes"], "answer": "Tongue" },
        { "question": "We use our ears to ___.", "options": ["See", "Hear", "Smell", "Taste"], "answer": "Hear" },
        { "question": "How many sense organs do we have?", "options": ["Three", "Four", "Five", "Six"], "answer": "Five" },
        { "question": "Our skin helps us to ___.", "options": ["See", "Feel/Touch", "Hear", "Smell"], "answer": "Feel/Touch" },
        { "question": "Which organ helps us see the stars?", "options": ["Nose", "Eyes", "Tongue", "Ears"], "answer": "Eyes" },
        { "question": "If something is 'soft', which sense tells us that?", "options": ["Hearing", "Taste", "Sight", "Touch"], "answer": "Touch" },
        { "question": "A rose has a nice smell. We know this using our ___.", "options": ["Nose", "Tongue", "Ears", "Eyes"], "answer": "Nose" },
        { "question": "Which of these is NOT a sense organ?", "options": ["Eyes", "Heart", "Nose", "Skin"], "answer": "Heart" }
      ],
      lessons: [
        { title: "The Power of Sight", explanation: "Our eyes are amazing! They take pictures of everything and send them to our brain. We can see the blue sky, green grass, and our parents' faces. Eyes help us read books and watch movies. We should always protect our eyes from bright sun and not look at screens for too long. Sight is often considered our most important sense because it helps us move around safely.", words: ["Sight", "Eyes", "Vision", "Color", "Shape", "Protect"], activities: "Close your eyes for a moment. Try to describe what you saw just before you closed them." },
        { title: "Hearing the World", explanation: "Our ears are always listening! They hear the chirping of birds, the music on the radio, and the voice of our teacher. Ears can hear loud sounds like a drum and soft sounds like a whisper. They also help us keep our balance so we don't fall down. We should never put sharp objects in our ears and avoid very loud noises that can hurt them.", words: ["Hearing", "Ears", "Sound", "Listen", "Loud", "Soft", "Music"], activities: "Sit quietly for 1 minute. Count how many different sounds you can hear." },
        { title: "Smelling & Tasting", explanation: "Our nose and tongue work together! The nose helps us smell yummy food, flowers, and even warns us about smoke. The tongue is covered in tiny 'taste buds' that tell us if something is sweet (like sugar), salty (like chips), sour (like lemon), or bitter. Most of the flavor of food actually comes from its smell! That's why food tastes different when you have a cold.", words: ["Smell", "Nose", "Taste", "Tongue", "Sweet", "Sour", "Salty", "Bitter"], activities: "Identify one food that is sweet and one that is sour." },
        { title: "The Sense of Touch", explanation: "Our whole body is covered in skin, and skin is our organ for touch. It helps us feel if something is hot or cold, rough or smooth, soft or hard. Touch is very important for safety—it tells us to pull our hand away if something is too hot. Skin also protects our inside parts from germs and keeps our body at the right temperature. It is the largest organ of our body!", words: ["Touch", "Skin", "Feel", "Soft", "Hard", "Hot", "Cold", "Texture"], activities: "Touch three different things in your room (like a pillow, a table, and a wall). How do they feel?" },
        { title: "Caring for our Senses", explanation: "Since our sense organs are so important, we must take good care of them. We should wash our eyes with clean water, not listen to music too loudly, clean our tongue while brushing, and keep our skin clean by bathing. When one sense doesn't work well (like needing glasses for sight), the other senses often become stronger. We should appreciate all five of our 'windows'!", words: ["Care", "Hygiene", "Protection", "Appreciate", "Healthy", "Senses"], activities: "Make a list of one way to care for each of your five sense organs." },
        { title: "Review: Sense Explorer", explanation: "Congratulations! You are now a Sense Explorer. You know about the five sense organs and how they help you experience the world. You can identify which organ is used for which task. Remember, your senses are always working to keep you safe and help you learn. Use them well every day to discover new things!", words: ["Explorer", "Experience", "Identify", "Discover", "Summary", "Senses"], activities: "Play a game with a friend where you describe an object using only your senses (e.g., 'It feels soft, it smells like vanilla'). See if they can guess it!" }
      ]
    },

    "My Family and Home": {
      content: "<h3><strong>Major Extension: Love and Shelter</strong></h3>\
<p>A family is a group of people who live together and love each other. A home is the place where a family lives. It protects us from heat, cold, rain, and wild animals. Every family is different—some are big and some are small—but the love is the same. In this chapter, we learn about different family members and the different rooms in our house. We also learn that helping each other makes a house a happy home.</p>\
<h3><strong>Key Concepts:</strong></h3>\
<ul>\
<li><strong>Nuclear Family:</strong> Small family with parents and children.</li>\
<li><strong>Joint Family:</strong> Big family with grandparents, uncles, aunts, and cousins.</li>\
<li><strong>Rooms in a Home:</strong> Kitchen, Bedroom, Bathroom, Living room.</li>\
<li><strong>Responsibilities:</strong> Helping parents and keeping the house clean.</li>\
</ul>",
      quiz: [
        { "question": "A small family is also called a ___ family.", "options": ["Joint", "Nuclear", "Big", "Friendly"], "answer": "Nuclear" },
        { "question": "Where do we cook our food?", "options": ["Bedroom", "Bathroom", "Kitchen", "Garden"], "answer": "Kitchen" },
        { "question": "Who are the parents of our parents?", "options": ["Uncles", "Aunts", "Grandparents", "Cousins"], "answer": "Grandparents" },
        { "question": "A house protects us from ___.", "options": ["Love", "Rain and Heat", "Books", "Toys"], "answer": "Rain and Heat" },
        { "question": "We sleep in the ___.", "options": ["Kitchen", "Dining room", "Bedroom", "Bathroom"], "answer": "Bedroom" },
        { "question": "What makes a house a 'Home'?", "options": ["Bricks", "Love and Care", "Paint", "Furniture"], "answer": "Love and Care" },
        { "question": "The children of our uncles and aunts are our ___.", "options": ["Brothers", "Sisters", "Cousins", "Friends"], "answer": "Cousins" },
        { "question": "We should help our parents to keep the house ___.", "options": ["Dirty", "Clean", "Loud", "Empty"], "answer": "Clean" }
      ],
      lessons: [
        { title: "Types of Families", explanation: "Families come in all shapes and sizes! A small family with just a father, mother, and one or two children is a 'Nuclear Family'. A big family where grandparents, uncles, aunts, and cousins live together is a 'Joint Family'. No matter the size, every member of the family is important. Family is the first place where we learn to share and care for others.", words: ["Family", "Nuclear", "Joint", "Member", "Share", "Care", "Size"], activities: "Draw your family tree. Include everyone who lives with you!" },
        { title: "Our Special Home", explanation: "A house is made of bricks, wood, or stone, but a home is made of love. Our home is our safe place. It keeps us dry when it rains and cool when the sun is hot. Inside our home, we feel safe and comfortable. We have different areas for different activities. We should always respect our home and the people who live in it.", words: ["House", "Home", "Shelter", "Safe", "Comfort", "Respect", "Bricks"], activities: "What is your favorite corner in your house? Why do you like it?" },
        { title: "Rooms in a House", explanation: "Most homes have different rooms for different jobs. We cook in the Kitchen, eat in the Dining Room, and sleep in the Bedroom. We wash ourselves in the Bathroom and talk to guests in the Living Room. Each room should be kept tidy. When we know the names of the rooms, we can talk about where things are kept in our house.", words: ["Kitchen", "Bedroom", "Bathroom", "Living Room", "Tidy", "Area"], activities: "Go to each room in your house and name it out loud. Find one object that belongs only in that room." },
        { title: "Helping at Home", explanation: "A happy home is one where everyone helps! Even small children can do big things, like putting toys away, watering plants, or helping set the table. When we help our parents, they feel happy and less tired. It also teaches us to be responsible. Taking care of our own things is the best way to start helping the family.", words: ["Help", "Responsible", "Tired", "Watering", "Table", "Small", "Big"], activities: "Choose one small job to help your mother or father with today (like folding your clothes)." },
        { title: "Family Values", explanation: "Families teach us how to be good people. We learn to say 'Please' and 'Thank You', to respect our elders, and to be kind to our siblings. These are called values. Good values help us make friends and do well at school. A family that eats together and plays together stays happy and strong forever.", words: ["Values", "Respect", "Kindness", "Manners", "Siblings", "Elders", "Strong"], activities: "Tell your parents one thing you love about your family." },
        { title: "Review: Family & Shelter", explanation: "We have learned that families provide us with love and homes provide us with shelter. Whether our family is big or small, and whether our house is large or tiny, what matters most is the kindness we show to each other. Keeping our home clean and our family members happy is a great way to grow up. You are a valued member of your family!", words: ["Review", "Love", "Shelter", "Kindness", "Valued", "Grow up", "Summary"], activities: "Draw a picture of your house and color it. Write 'Home Sweet Home' at the top." }
      ]
    },
    "Picture Time": {
      content: "<h3><strong>Main focus: Observation, speaking, naming pictures</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter uses pictures to help children think and speak. Pictures are very helpful for young learners because they can see and understand quickly. Children learn to look carefully, notice small details, and say what they see. They may talk about people, animals, things, and actions in the pictures. This builds both vocabulary and speaking confidence. It also trains the child to observe before answering, which is an important learning skill.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Naming words from pictures:</strong> dog, tree, ball, child</li>\
<li>Use of 'a' and 'an' before singular nouns</li>\
<li>Simple describing words: big, small, happy, red</li>\
<li>Speaking in complete sentences</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Look at a picture and say five things you can see.</li>\
<li>Color a picture and name the objects in it.</li>\
<li>Match words with picture cards.</li>\
</ul>",
      quiz: [{ "question": "Which article is used before a singular noun starting with a consonant sound?", "options": ["An", "A", "The", "Some"], "answer": "A" }, { "question": "Which of these is a describing word?", "options": ["Tree", "Big", "Dog", "Child"], "answer": "Big" }],
      topics: ["Object Identification", "Using A and An", "Describing Objects"]
    },
    "The Cap-seller and the Monkeys": {
      content: "<h3><strong>Main focus: Story, problem solving, listening</strong></h3>\
<p><strong>Detailed explanation:</strong> This story is about a cap-seller who carries caps on his head and walks through a forest. The monkeys watch him and take the caps when he sleeps. The cap-seller becomes worried, but he uses his thinking power to solve the problem. He shows the monkeys that copying him will not help them. The story is interesting because it teaches children that calm thinking is better than panic. It also shows that smart ideas can solve difficult situations.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Story words:</strong> cap-seller, monkeys, forest, sleep</li>\
<li><strong>Action words:</strong> carry, take, throw, sleep</li>\
<li>Use of past action in simple storytelling</li>\
<li>Naming people and animals</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Act out the story in class or at home.</li>\
<li>Draw the cap-seller and the monkeys.</li>\
<li>Talk about a time when you solved a small problem.</li>\
</ul>",
      quiz: [{ "question": "Who took the caps from the cap-seller?", "options": ["Birds", "Lions", "Monkeys", "Children"], "answer": "Monkeys" }, { "question": "What did the cap-seller use to solve his problem?", "options": ["Panic", "Thinking power", "Running away", "Shouting"], "answer": "Thinking power" }],
      topics: ["Story Listening", "Problem Solving", "Action Words"]
    },
    "A Farm": {
      content: "<h3><strong>Main focus: Farm life, animals, food, places</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter takes children to a farm, which is a place where crops are grown and animals live. Children learn that farms give us food like vegetables, grains, milk, and eggs. They also see that farmers work very hard to grow food for everyone. The chapter helps children understand the connection between nature, food, and the people who grow it. It is useful because it builds respect for farmers and for the food on our plate. Children can relate this to their own meals and the world around them.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Naming words:</strong> farm, farmer, cow, goat, crop</li>\
<li><strong>Plural forms:</strong> cow/cows, crop/crops</li>\
<li><strong>Describing words:</strong> green field, big farm</li>\
<li><strong>Sentence:</strong> The farmer grows crops.</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Draw a farm scene with animals and crops.</li>\
<li>Name foods that come from farms.</li>\
<li>Sort food into plant food and animal food.</li>\
</ul>",
      quiz: [{ "question": "Who works on a farm to grow food?", "options": ["Teacher", "Farmer", "Doctor", "Pilot"], "answer": "Farmer" }, { "question": "Which of these is the plural form of cow?", "options": ["Cow", "Cowes", "Cows", "Cowen"], "answer": "Cows" }],
      topics: ["Farm Animals", "Crops and Food", "Singular and Plural"]
    },
    "Fun with Pictures": {
      content: "<h3><strong>Main focus: Vocabulary building through visual learning</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter helps children learn through pictures, which makes reading easier and more enjoyable. Young learners often understand better when they can see objects and actions before reading the words. The chapter may include animals, toys, fruits, or daily life objects. Children learn to connect each picture with its name and meaning. This helps them remember words for a longer time. It also prepares them to read independently because they begin to recognize patterns in what they see.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li>Naming words from visual objects</li>\
<li>Singular and plural recognition</li>\
<li>Word-picture association</li>\
<li>Basic sentence building</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Make flashcards with pictures and words.</li>\
<li>Tell a story from a set of pictures.</li>\
<li>Point to objects and say their names.</li>\
</ul>",
      quiz: [{ "question": "What does visual learning involve?", "options": ["Reading text only", "Learning through pictures", "Listening to a song", "Writing numbers"], "answer": "Learning through pictures" }, { "question": "What does word-picture association help with?", "options": ["Forgetting words", "Remembering words longer", "Drawing faster", "Running faster"], "answer": "Remembering words longer" }],
      topics: ["Visual Vocabulary", "Word Association", "Simple Sentences"]
    },
    "The Food We Eat": {
      content: "<h3><strong>Main focus: Food, health, and daily habits</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter teaches children about the food we eat every day. It shows that food gives us energy, helps us grow, and keeps us healthy. Children can learn to name fruits, vegetables, grains, milk, and other simple foods. The chapter also helps them understand that clean and healthy food is better for the body. It may also encourage children to eat a variety of foods rather than only one kind. This makes the chapter important for both language learning and health awareness.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Food names:</strong> apple, rice, milk, banana, chapati</li>\
<li>Singular and plural food words</li>\
<li><strong>Describing words:</strong> tasty, fresh, hot, sweet</li>\
<li><strong>Sentence:</strong> I eat an apple.</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Make a healthy food chart.</li>\
<li>Sort foods into fruits, vegetables, and grains.</li>\
<li>Talk about your favorite healthy breakfast.</li>\
</ul>",
      quiz: [{ "question": "Why do we eat food?", "options": ["To stay hungry", "To get energy and grow", "To sleep all day", "To fly"], "answer": "To get energy and grow" }, { "question": "Which is a describing word for food?", "options": ["Chair", "Tasty", "Run", "Milk"], "answer": "Tasty" }],
      topics: ["Food Names", "Healthy Habits", "Describing Food"]
    },
    "The Four Seasons": {
      content: "<h3><strong>Main focus: Nature, weather, seasonal change</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter introduces children to the idea that weather changes during the year. Some days are hot, some are cold, some bring rain, and some feel pleasant. Children learn that different seasons need different clothes, food, and habits. This is a useful chapter because it connects English with real life. Children can understand that nature changes in a cycle and that we should observe the sky and weather. The lesson also builds vocabulary related to rain, sun, wind, and cold.</p\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Season words:</strong> summer, winter, rainy, spring</li>\
<li><strong>Weather words:</strong> hot, cold, windy, sunny</li>\
<li>Use of 'is' and 'are' in simple sentences</li>\
<li>Describing the weather</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Make a seasons wheel with drawings.</li>\
<li>Say what clothes we wear in each season.</li>\
<li>Draw a rainy day and a sunny day.</li>\
</ul>",
      quiz: [{ "question": "Which of the following is a season word?", "options": ["Sun", "Cold", "Summer", "Wind"], "answer": "Summer" }, { "question": "What kind of clothes do we wear in winter?", "options": ["Cotton clothes", "Raincoats", "Warm clothes", "Swimsuits"], "answer": "Warm clothes" }],
      topics: ["Summer and Winter", "Rainy Season", "Weather Words"]
    },
    "Anandi’s Rainbow": {
      content: "<h3><strong>Main focus: Colours, beauty of nature, observation</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter shows the beauty of a rainbow in the sky. A rainbow appears when sunlight and rain come together in the right way. Children enjoy learning the names of colours because colours are easy to see and remember. The story encourages children to look at nature carefully and feel happy about it. It also builds curiosity because children often ask when and why a rainbow appears. This makes science, language, and imagination come together in one lovely chapter.</p>\
<h3><strong>Grammar focus:</strong></h3>\
<ul>\
<li><strong>Colour words:</strong> red, blue, green, yellow, orange</li>\
<li><strong>Describing words:</strong> bright, beautiful, colourful</li>\
<li><strong>Simple sentence:</strong> The rainbow is colourful.</li>\
<li>Using 'looks' and 'is' in short sentences</li>\
</ul>\
<h3><strong>Activities:</strong></h3>\
<ul>\
<li>Draw and colour a rainbow.</li>\
<li>Name colours around you in the room.</li>\
<li>Make a colour matching game.</li>\
</ul>",
      quiz: [{ "question": "When does a rainbow appear?", "options": ["At night", "When sunlight and rain come together", "When it snows", "When it is very hot and dry"], "answer": "When sunlight and rain come together" }, { "question": "Which is a describing word for a rainbow?", "options": ["Boring", "Colourful", "Small", "Invisible"], "answer": "Colourful" }],
      topics: ["Colours", "Nature Observation", "Rainbow Formation"]
    },

    "My Family and Me": {
      content: `
<h3><strong>What this chapter is about</strong></h3>
<p>This chapter begins Class 1 English with the child’s own world: the body, simple actions, cleanliness, and the people around them. It helps children learn the names of body parts and understand why each part is useful. It also introduces the idea that we should keep ourselves clean and healthy. The lesson is designed in a very gentle way so children can learn by seeing, saying, doing, and repeating. The chapter also builds confidence because children talk about themselves, their family, and the things they do every day. NCERT’s Class 1 English introduction shows that the book is built around familiar themes like family, body parts, politeness, animals, and plants, so children connect language to real life.</p>

<h3><strong>Detailed explanation</strong></h3>
<p>A small child learns first from the things closest to them. This chapter uses that idea very well. Children look at their own hands, eyes, legs, nose, mouth, ears, and other body parts. They slowly understand that each part has a job. Hands help us hold, clap, write, and eat. Eyes help us see. Ears help us hear. Legs help us walk and run. Nose helps us smell. Mouth helps us speak and eat. The chapter also teaches that body parts should be kept clean and cared for, because cleanliness is part of good health. This makes the lesson useful in daily life, not just in the classroom.</p>
<p>The chapter is also important because it connects language with movement. When a child says “clap,” they can clap. When they say “blink,” they can blink. When they say “walk,” they can walk. This is how young children learn better: by doing the action while saying the word.</p>
<p>Another important idea in this chapter is self-awareness. Children begin to notice that their body is special and valuable. They understand that they should wash hands, brush teeth, bathe, comb hair, and keep their nails clean.</p>

<h3><strong>Word meanings</strong></h3>
<p><strong>Body parts</strong></p>
<ul>
<li><strong>hand</strong> — part of the body used for holding and doing work</li>
<li><strong>eye</strong> — part of the body used for seeing</li>
<li><strong>ear</strong> — part of the body used for hearing</li>
<li><strong>nose</strong> — part of the body used for smelling</li>
<li><strong>mouth</strong> — part of the body used for eating and speaking</li>
<li><strong>leg</strong> — part of the body used for walking and running</li>
</ul>

<p><strong>Action words</strong></p>
<ul>
<li><strong>clap</strong> — to strike hands together</li>
<li><strong>blink</strong> — to close and open eyes quickly</li>
<li><strong>walk</strong> — to move on feet</li>
<li><strong>run</strong> — to move fast on feet</li>
<li><strong>smile</strong> — to show happiness on the face</li>
</ul>

<p><strong>Cleanliness words</strong></p>
<ul>
<li><strong>clean</strong> — free from dirt</li>
<li><strong>wash</strong> — to remove dirt using water</li>
<li><strong>healthy</strong> — strong and well</li>
<li><strong>neat</strong> — tidy and well kept</li>
</ul>

<h3><strong>Grammar for kids</strong></h3>
<p><strong>1. Naming words</strong><br/>
These are words that name people, places, animals, or things.<br/>
Examples: hand, eye, leg, child, family</p>

<p><strong>2. Action words</strong><br/>
These are words that show what we do.<br/>
Examples: clap, run, walk, blink, smile</p>

<p><strong>3. Describing words</strong><br/>
These tell us more about a noun.<br/>
Examples: clean hands, big eyes, little child, healthy body</p>

<p><strong>4. Simple sentence pattern</strong><br/>
I + action word + body part<br/>
Examples: I clap my hands. I blink my eyes.</p>

<p><strong>5. “This is” and “These are”</strong><br/>
This is my hand. This is my nose. These are my eyes. These are my legs.</p>

<h3><strong>Subtopics in this chapter</strong></h3>
<ul>
<li>body parts</li>
<li>actions of body parts</li>
<li>cleanliness and hygiene</li>
<li>speaking about self</li>
<li>simple sentence building</li>
<li>observation and identification</li>
</ul>

<h3><strong>Step-by-step understanding</strong></h3>
<ol>
<li>First, children look at a picture or their own body and identify parts one by one.</li>
<li>Then they repeat the words aloud so they remember them.</li>
<li>After that, they connect each body part with its job, such as seeing, hearing, walking, or writing.</li>
<li>Next, they learn why staying clean is important.</li>
<li>Finally, they use full simple sentences to talk about themselves.</li>
</ol>

<h3><strong>Activity ideas</strong></h3>
<ul>
<li>You can ask the child to stand in front of a mirror and point to each body part.</li>
<li>You can also play a simple game: say “touch your eyes,” “clap your hands,” or “stamp your feet.”</li>
<li>Another useful activity is drawing a child and labeling the body parts.</li>
<li>A hygiene chart can also be made showing brush teeth, wash hands, bathe, comb hair, and trim nails.</li>
</ul>

<h3><strong>Teacher or parent note</strong></h3>
<p>This chapter should be taught with actions, not only reading. The child should point, touch, repeat, and speak. That makes learning easier and more fun. Praise the child when they say complete sentences, even if the sentence is very small. Gentle repetition works best here.</p>
`,
      quiz: [
        { question: "What do we use our eyes for?", options: ["Smelling", "Hearing", "Seeing", "Walking"], answer: "Seeing" },
        { question: "Which word is an action word?", options: ["Hand", "Clap", "Nose", "Child"], answer: "Clap" },
        { question: "What do we say when we wake up?", options: ["Good Night", "Good Morning", "Goodbye", "Sorry"], answer: "Good Morning" },
        { question: "Who are our parents?", options: ["Uncles", "Mother and Father", "Friends", "Teachers"], answer: "Mother and Father" },
        { question: "How many hands do we have?", options: ["One", "Two", "Three", "Four"], answer: "Two" },
        { question: "We use our ___ to smell a flower.", options: ["Ear", "Eye", "Nose", "Hand"], answer: "Nose" },
        { question: "Which of these is a polite word?", options: ["Run", "Please", "Jump", "Loud"], answer: "Please" },
        { question: "Where do we cook food?", options: ["Bedroom", "Bathroom", "Kitchen", "Garden"], answer: "Kitchen" },
        { question: "We should ___ our hands before eating.", options: ["Dirty", "Wash", "Hide", "Paint"], answer: "Wash" },
        { question: "Who tells us stories in the family?", options: ["Grandparents", "Pets", "Toys", "Strangers"], answer: "Grandparents" }
      ],
      lessons: [
        { 
          title: "Introduction: My Family", 
          explanation: "Every person is special and unique! This chapter begins by looking at your own world: your body and the people around you. There was a little boy who loved his family very much. He lived in a happy house with his mother, father, and sister. He realized that a family is a group of people who live together and care for each other.", 
          words: ["Boy", "Family", "Love", "Together", "House", "Live", "Happy"],
          activities: "Think about your family. Who lives with you in your house? Draw a small picture of your family holding hands."
        },
        { 
          title: "Concept Deep-Dive: My Parents", 
          explanation: "A small child learns first from the things closest to them. Our mother and father are our parents. They take care of us, give us food, and help us learn new things every day. They work hard to keep us safe and healthy. In NCERT's introduction, we learn that family is the first school for any child.", 
          words: ["Mother", "Father", "Parents", "Care", "Food", "Learn", "Safe", "Healthy"],
          activities: "List two things your mother or father did for you today (like making breakfast or helping with homework). Say 'Thank You' to them!"
        },
        { 
          title: "My Siblings & Friends", 
          explanation: "Brothers and sisters are called siblings. They are our first friends at home. We share our toys, play games, and grow up together. Having siblings means you always have someone to play with. You learn to share and be kind.", 
          words: ["Brother", "Sister", "Siblings", "Share", "Play", "Games", "Grow"],
          activities: "What is your favorite game to play with your brother, sister, or friend? Write the name of the game."
        },
        { 
          title: "Grandparents & Elders", 
          explanation: "Grandparents are the parents of our parents. They tell us wonderful stories about the past and give us lots of love and special treats! They are the oldest and wisest members of our family. We should always respect and listen to them.", 
          words: ["Grandfather", "Grandmother", "Stories", "Love", "Treats", "Elders", "Respect"],
          activities: "Ask your grandfather or grandmother to tell you a story about when they were little children. What was their favorite toy?"
        },
        { 
          title: "Helping Each Other", 
          explanation: "In a happy family, everyone helps each other. We can help by keeping our room tidy, putting toys away, and being neat and clean. When everyone helps, the house stays happy and beautiful. Cleanliness is a very important part of staying healthy.", 
          words: ["Help", "Tidy", "Kind", "Manners", "Neat", "Clean", "Responsible"],
          activities: "Go to your room and find three toys that are not in their place. Put them back neatly where they belong!"
        },
        { 
          title: "Review: My Body & Family", 
          explanation: "We have learned that our body is a wonderful machine and our family is our support. We use our hands to clap, eyes to see, and feet to walk. We must keep our body clean and our family happy by being polite and helpful every day.", 
          words: ["Hand", "Eye", "Ear", "Nose", "Mouth", "Leg", "Clap", "Blink", "Walk", "Run", "Smile", "Wash", "Review"],
          activities: "Stand in front of a mirror. Point to your eyes, ears, and nose. Now, smile big and say 'I love my family!'"
        }
      ]
    },

    "A Happy Child": {
      content: "Welcome to the lesson on A Happy Child! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Happy Child?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Happy Child?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Three Little Pigs": {
      content: "Welcome to the lesson on Three Little Pigs! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Three Little Pigs?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Three Little Pigs?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "After a Bath": {
      content: "Welcome to the lesson on After a Bath! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in After a Bath?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from After a Bath?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Bubble, the Straw and the Shoe": {
      content: "Welcome to the lesson on The Bubble, the Straw and the Shoe! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Bubble, the Straw and the Shoe?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Bubble, the Straw and the Shoe?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "One Little Kitten": {
      content: "Welcome to the lesson on One Little Kitten! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in One Little Kitten?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from One Little Kitten?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Lalu and Peelu": {
      content: "Welcome to the lesson on Lalu and Peelu! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Lalu and Peelu?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Lalu and Peelu?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Once I Saw a Little Bird": {
      content: "Welcome to the lesson on Once I Saw a Little Bird! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Once I Saw a Little Bird?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Once I Saw a Little Bird?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Mittu and the Yellow Mango": {
      content: "Welcome to the lesson on Mittu and the Yellow Mango! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Mittu and the Yellow Mango?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Mittu and the Yellow Mango?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Merry-Go-Round": {
      content: "Welcome to the lesson on Merry-Go-Round! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Merry-Go-Round?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Merry-Go-Round?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Circle": {
      content: "Welcome to the lesson on Circle! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Circle?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Circle?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "If I Were an Apple": {
      content: "Welcome to the lesson on If I Were an Apple! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in If I Were an Apple?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from If I Were an Apple?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Our Tree": {
      content: "Welcome to the lesson on Our Tree! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Our Tree?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Our Tree?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Kite": {
      content: "Welcome to the lesson on A Kite! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Kite?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Kite?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Sundari": {
      content: "Welcome to the lesson on Sundari! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Sundari?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Sundari?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Little Turtle": {
      content: "Welcome to the lesson on A Little Turtle! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Little Turtle?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Little Turtle?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Tiger and the Mosquito": {
      content: "Welcome to the lesson on The Tiger and the Mosquito! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Tiger and the Mosquito?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Tiger and the Mosquito?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Clouds": {
      content: "Welcome to the lesson on Clouds! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Clouds?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Clouds?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Anandi’s Rainbow": {
      content: "Welcome to the lesson on Anandi’s Rainbow! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Anandi’s Rainbow?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Anandi’s Rainbow?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Jhoola": {
      content: "Welcome to the lesson on Jhoola! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Jhoola?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Jhoola?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Aam Ki Kahani": {
      content: "Welcome to the lesson on Aam Ki Kahani! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Aam Ki Kahani?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Aam Ki Kahani?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Aam Ki Tokri": {
      content: "Welcome to the lesson on Aam Ki Tokri! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Aam Ki Tokri?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Aam Ki Tokri?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Patte Hi Patte": {
      content: "Welcome to the lesson on Patte Hi Patte! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Patte Hi Patte?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Patte Hi Patte?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Pakodi": {
      content: "Welcome to the lesson on Pakodi! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Pakodi?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Pakodi?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Chhuk-Chhuk Gaadi": {
      content: "Welcome to the lesson on Chhuk-Chhuk Gaadi! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Chhuk-Chhuk Gaadi?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Chhuk-Chhuk Gaadi?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Rasoighar": {
      content: "Welcome to the lesson on Rasoighar! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Rasoighar?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Rasoighar?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Chuho! Myau So Rahi Hai": {
      content: "Welcome to the lesson on Chuho! Myau So Rahi Hai! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Chuho! Myau So Rahi Hai?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Chuho! Myau So Rahi Hai?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Bandar Aur Gilhari": {
      content: "Welcome to the lesson on Bandar Aur Gilhari! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bandar Aur Gilhari?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bandar Aur Gilhari?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Pagdi": {
      content: "Welcome to the lesson on Pagdi! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Pagdi?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Pagdi?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Patang": {
      content: "Welcome to the lesson on Patang! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Patang?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Patang?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Gend-Balla": {
      content: "Welcome to the lesson on Gend-Balla! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Gend-Balla?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Gend-Balla?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Bandar Gaya Khet Mein": {
      content: "Welcome to the lesson on Bandar Gaya Khet Mein! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bandar Gaya Khet Mein?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bandar Gaya Khet Mein?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Ek Budhiya": {
      content: "Welcome to the lesson on Ek Budhiya! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Ek Budhiya?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Ek Budhiya?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Main Bhi": {
      content: "Welcome to the lesson on Main Bhi! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Main Bhi?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Main Bhi?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Shapes and Space": {
      content: `<h3><strong>Main focus: Space words and shapes that roll or slide</strong></h3>
<p><strong>Chapter summary:</strong> Before we count numbers, we must understand <em>where</em> things are. This chapter teaches position words called "Map Words" — <strong>Inside / Outside, On / Under, Above / Below, Near / Far, Top / Bottom</strong>. We also learn that shapes move in special ways: <strong>round things roll</strong> (ball, orange, coin on its edge) and <strong>long flat things slide</strong> (pencil, book, matchbox). Some objects like a coin can both roll and slide!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Position words:</strong> Inside, Outside, On, Under, Above, Below, Near, Far, Top, Bottom</li>
<li><strong>Round shapes</strong> have no corners and like to <strong>Roll</strong></li>
<li><strong>Long / flat shapes</strong> have flat sides and like to <strong>Slide</strong></li>
<li>A coin can slide when flat, but rolls when standing on its edge</li>
</ul>`,
      quiz: [
        { question: "A bird is flying in the sky. The bird is _____ you.", options: ["Below", "Under", "Above", "Inside"], answer: "Above" },
        { question: "Which of these objects will ROLL on the floor?", options: ["A matchbox", "A book", "A ball", "A pencil"], answer: "A ball" },
        { question: "The cat is sitting in the basket. The cat is _____ the basket.", options: ["Outside", "Above", "Inside", "Below"], answer: "Inside" },
        { question: "Which shape movement does a pencil usually make when pushed on the floor?", options: ["Roll", "Slide", "Jump", "Spin"], answer: "Slide" },
        { question: "On a traffic signal, the red light is at the _____.", options: ["Bottom", "Middle", "Top", "Side"], answer: "Top" }
      ]
    },
    "Numbers from One to Nine": {
      content: `<h3><strong>Main focus: Counting 1–9, More / Less, and Zero</strong></h3>
<p><strong>Chapter summary:</strong> Counting is giving a name to "how many." Each number is <strong>one more</strong> than the number before it. We compare groups using <strong>More</strong> (bigger group) and <strong>Less</strong> (smaller group). We also learn about <strong>Zero (0)</strong>, which means nothing is there — if you eat all 5 apples, 0 apples are left!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Numbers 1–9 in order: 1, 2, 3, 4, 5, 6, 7, 8, 9</li>
<li>Each number is <strong>one more</strong> than the previous</li>
<li><strong>More vs Less:</strong> 7 chocolates is more than 3 chocolates</li>
<li><strong>Zero (0)</strong> means none / nothing</li>
</ul>`,
      quiz: [
        { question: "How many fingers are on one hand?", options: ["4", "5", "6", "3"], answer: "5" },
        { question: "What is one more than 4?", options: ["3", "4", "5", "6"], answer: "5" },
        { question: "Which group has LESS: 3 chocolates or 7 chocolates?", options: ["7 chocolates", "3 chocolates", "Both are equal", "Cannot say"], answer: "3 chocolates" },
        { question: "You have 5 apples and eat all 5. How many are left?", options: ["1", "5", "2", "0"], answer: "0" },
        { question: "Which number comes just before 9?", options: ["7", "10", "8", "6"], answer: "8" }
      ]
    },
    "Addition": {
      content: "<h3><strong>Major Extension: The World of Combining Numbers</strong></h3>\
<p>Addition is the foundation of all mathematics. When we put two groups together, we find a new, bigger number called the SUM. Imagine you have a basket of 3 red apples and another basket with 4 green apples. When you pour them all into one big basket, you can count them all: 1, 2, 3, 4, 5, 6, 7! This is the magic of addition.</p>\
<h3><strong>Key Concepts:</strong></h3>\
<ul>\
<li><strong>The Plus Sign (+):</strong> This symbol tells us 'Put them together!'</li>\
<li><strong>The Equals Sign (=):</strong> This symbol tells us 'The result is...'</li>\
<li><strong>Adding Zero:</strong> A very important trick! Any number plus zero stays exactly the same.</li>\
<li><strong>Counting On:</strong> If you have 5 and want to add 3, start at 5 and count forward 3 steps: 6, 7, 8!</li>\
</ul>",
      quiz: [
        { question: "What is 2 + 3?", options: ["4", "5", "6", "7"], answer: "5" },
        { question: "If you have 1 ball and buy 1 more, how many do you have?", options: ["1", "2", "3", "0"], answer: "2" },
        { question: "3 plus 0 equals ___.", options: ["0", "1", "2", "3"], answer: "3" },
        { question: "What is 4 + 4?", options: ["7", "8", "9", "10"], answer: "8" },
        { question: "One more than 5 is ___.", options: ["4", "5", "6", "7"], answer: "6" },
        { question: "If there are 4 birds and 2 more join, how many total?", options: ["5", "6", "7", "8"], answer: "6" },
        { question: "What is 7 + 2 using counting on?", options: ["8", "9", "10", "11"], answer: "9" },
        { question: "Which sign is for addition?", options: ["-", "+", "=", "x"], answer: "+" }
      ],
      lessons: [
        { title: "The Concept of 'All Together'", explanation: "Addition is like building a tower. Each block you add makes the tower taller. In this lesson, we learn that when we have two separate groups (like 2 cats and 1 cat), we can bring them together to find the total. 'All together' is the most important phrase in addition! Whether it is toys, fruits, or friends, adding them up helps us see the big picture.", words: ["Together", "Total", "Combine", "Tower", "Group", "Sum"], activities: "Take 3 pencils. Now take 2 more. Put them in one hand. Count them: 1, 2, 3, 4, 5!" },
        { title: "The Magic Plus Sign (+)", explanation: "The plus sign (+) is like a bridge. It connects two numbers and asks them to become one new number. In this lesson, we practice drawing the plus sign and placing it between numbers. When we see 2 + 2, we know the bridge is bringing the two groups of 2 together to form a group of 4. It is the most used sign in the world of math!", words: ["Plus", "Bridge", "Symbol", "Connect", "Operation", "Sign"], activities: "Draw 5 big plus signs on a paper and decorate them with your favorite colors." },
        { title: "Counting On Strategy", explanation: "This is a super-fast trick! Instead of starting from 1, we start from the bigger number. If you have 6 + 2, you don't count 1, 2, 3, 4, 5, 6... you just start at 6 and say: '6... 7, 8!' Two more steps. This 'Counting On' trick makes adding much faster as numbers get bigger. Practice starting from 5, 7, or 9 and adding small numbers.", words: ["Strategy", "Trick", "Fast", "Forward", "Next", "Steps"], activities: "Try to add 4 + 3 by starting at 4 and counting 3 steps forward. What do you get?" },
        { title: "Addition with Zero", explanation: "Zero (0) is a very special number. It means 'nothing'. So, if you have 8 chocolates and your friend gives you 0 more, you still have 8 chocolates! In this lesson, we learn that any number added to zero remains the same. It's like adding an empty box to a full one. 1+0=1, 2+0=2, and even 9+0=9. Zero is the hero who doesn't change anything!", words: ["Zero", "Nothing", "Empty", "Same", "Rule", "Hero"], activities: "What is 7 + 0? What is 0 + 5? Write the answers and notice how they don't change!" },
        { title: "Real Life Addition Stories", explanation: "We use addition every day! 'I have 2 cookies, mom gives me 2 more. How many now?' These are addition stories. They help us understand why we learn math. From counting money to counting friends at a party, addition is everywhere. In this lesson, we will make up our own stories about toys, animals, and school items.", words: ["Stories", "Real-life", "Problem", "Logic", "Everyday", "Cookies"], activities: "Tell a story about 3 birds on a branch and 2 more flying in. How many birds are in your story?" },
        { title: "Final Review & Speed Test", explanation: "Now you are an Addition Expert! We have learned the bridge sign (+), the counting on trick, and the zero rule. Let's practice adding quickly. Speed comes with practice! We will solve many small problems to see how fast we can find the sum. Remember: practice makes perfect in the world of numbers.", words: ["Expert", "Speed", "Practice", "Perfect", "Numbers", "Review"], activities: "Solve 10 simple addition problems (like 1+1, 2+2) as fast as you can!" }
      ]
    },

    "Subtraction": {
      content: "<h3><strong>Major Extension: The Art of Taking Away</strong></h3>\
<p>Subtraction is like a magic trick where things disappear! It is the process of taking some things away from a group to find out what is LEFT or REMAINING. If you have 6 balloons and 2 burst, you can't have 6 anymore. You subtract the 2 to find your answer. It is the opposite of addition. Where addition builds up, subtraction counts down.</p>\
<h3><strong>Key Concepts:</strong></h3>\
<ul>\
<li><strong>The Minus Sign (-):</strong> This symbol says 'Take it away!'</li>\
<li><strong>The Difference:</strong> The result of a subtraction problem.</li>\
<li><strong>Subtracting Zero:</strong> Just like addition, subtracting nothing leaves the number the same.</li>\
<li><strong>Subtracting from Itself:</strong> If you have 5 and take away 5, you always get ZERO.</li>\
</ul>",
      quiz: [
        { question: "What is 5 - 2?", options: ["2", "3", "4", "5"], answer: "3" },
        { question: "If you have 4 balloons and 1 bursts, how many are left?", options: ["2", "3", "4", "5"], answer: "3" },
        { question: "9 minus 0 equals ___.", options: ["0", "9", "1", "8"], answer: "9" },
        { question: "What is 8 - 8?", options: ["0", "1", "8", "16"], answer: "0" },
        { question: "One less than 6 is ___.", options: ["4", "5", "6", "7"], answer: "5" },
        { question: "If there are 10 eggs and 2 break, how many are left?", options: ["7", "8", "9", "11"], answer: "8" },
        { question: "What is the minus sign?", options: ["+", "-", "=", "x"], answer: "-" }
      ],
      lessons: [
        { title: "The Concept of 'Remaining'", explanation: "Subtraction is about finding out what is 'Remaining' or 'Left over'. Imagine a plate of 5 cookies. You eat 2. The cookies didn't just disappear—they were taken away by you! Now you count what is left: 1, 2, 3. In this lesson, we focus on the word 'Remaining'. Whenever something is eaten, lost, broken, or given away, we use subtraction.", words: ["Remaining", "Left-over", "Eaten", "Lost", "Broken", "Away"], activities: "Take 6 toy cars. Move 3 away. Count how many are 'remaining' on the floor." },
        { title: "The Minus Sign (-) & Difference", explanation: "The minus sign (-) is a small horizontal line. It is the symbol for subtraction. When you see it, you know a group is going to get smaller. The answer we get in subtraction is called the 'Difference'. If we subtract 2 from 10, the difference is 8. In this lesson, we practice writing the minus sign and identifying the difference in simple problems.", words: ["Minus", "Sign", "Difference", "Smaller", "Symbol", "Operation"], activities: "Draw a big minus sign. Under it, write 'I make things smaller!' in your best handwriting." },
        { title: "Counting Back Strategy", explanation: "Just like addition has counting on, subtraction has 'Counting Back'. To solve 8 - 3, start at 8 and count backward 3 steps: 7, 6, 5! You landed on 5, so that is the answer. Counting back is like walking down the stairs. Each step makes the number smaller until you reach your answer. This is a very useful trick for quick math.", words: ["Backwards", "Strategy", "Steps", "Stairs", "Landed", "Quick"], activities: "Try to count backwards from 10 to 1 out loud. 10, 9, 8... Now try 7 minus 2 by counting back." },
        { title: "Subtracting Zero and Itself", explanation: "Subtraction has two very easy rules! First, any number minus zero is the same number (8 - 0 = 8). Second, any number minus ITSELF is always zero (8 - 8 = 0). If you have 5 apples and give 5 apples away, you have none left! In this lesson, we learn these two special cases that make subtraction feel like a game.", words: ["Zero", "Itself", "Nothing", "Rule", "Empty", "None"], activities: "What is 10 - 0? What is 10 - 10? Notice the big difference between the two!" },
        { title: "Subtraction Stories in the Wild", explanation: "Let's tell stories about subtraction! 'Ten birds were in a tree. Six flew away. How many stay?' We use subtraction to solve mysteries like these. In this lesson, we will look at pictures of animals, toys, and foods and create stories where things are taken away. Being able to tell a math story means you really understand how it works!", words: ["Mystery", "Wild", "Stay", "Flew", "Pictures", "Understand"], activities: "Tell a story about 5 balloons. One pops! How many are left in your story?" },
        { title: "Final Review: Subtraction Master", explanation: "You are now a Subtraction Master! You know the minus sign (-), the difference, and the counting back trick. You can solve stories and work with zero. Subtraction is a key skill for sharing and organizing your life. From sharing snacks to knowing how many days are left until your birthday, you will use subtraction every single day. Keep practicing!", words: ["Master", "Skill", "Life", "Sharing", "Days", "Practice"], activities: "Practice subtracting from 10. How many problems can you solve in 1 minute?" }
      ]
    },
    "Numbers from Ten to Twenty": {
      content: `<h3><strong>Main focus: The secret of 10 — Tens and Ones (10–20)</strong></h3>
<p><strong>Chapter summary:</strong> This is the most important secret in maths! Once we have 10 ones, we tie them into a <strong>Bundle</strong> called <strong>1 Ten</strong>. So: 11 = 1 Ten + 1 One, 15 = 1 Ten + 5 Ones, 20 = 2 Tens. By grouping into tens, we can count large numbers quickly!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>10 Ones = 1 Ten (a bundle)</strong></li>
<li>11 = 1 Ten + 1 One</li>
<li>15 = 1 Ten + 5 Ones</li>
<li>19 comes just before 20; 20 comes just after 19</li>
<li>Numbers 10–20 in order: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20</li>
</ul>`,
      quiz: [
        { question: "How many Tens are in the number 10?", options: ["0", "2", "10", "1"], answer: "1" },
        { question: "What number is 1 Ten and 3 Ones?", options: ["3", "31", "13", "103"], answer: "13" },
        { question: "You have 18 sticks. How many bundles of ten can you make? How many are left over?", options: ["1 bundle, 8 left", "2 bundles, 8 left", "1 bundle, 18 left", "8 bundles, 1 left"], answer: "1 bundle, 8 left" },
        { question: "What number comes just after 19?", options: ["18", "21", "20", "15"], answer: "20" },
        { question: "15 = 1 Ten + ___ Ones", options: ["1", "15", "5", "10"], answer: "5" }
      ]
    },
    "Time": {
      content: `<h3><strong>Main focus: Order of events and parts of the day</strong></h3>
<p><strong>Chapter summary:</strong> Time is about the <strong>order</strong> of things. We do things in the <strong>Morning</strong> (brush teeth), <strong>Afternoon</strong> (have lunch), and <strong>Night</strong> (sleep). We use words like <strong>First, Next, and Last</strong> to describe our day. Some activities take more time (watching a movie) and some take less time (brushing teeth).</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Parts of the day:</strong> Morning → Afternoon → Night</li>
<li><strong>Sequence words:</strong> First, Next, Last</li>
<li>We see <strong>stars at Night</strong>, not in the Morning</li>
<li>Days of the week in order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday</li>
</ul>`,
      quiz: [
        { question: "What do you do FIRST: Put on socks or put on shoes?", options: ["Put on shoes", "Put on socks", "Both at the same time", "Neither"], answer: "Put on socks" },
        { question: "When do you see stars in the sky?", options: ["Morning", "Afternoon", "Night", "Noon"], answer: "Night" },
        { question: "Which takes MORE time: Brushing teeth or watching a movie?", options: ["Brushing teeth", "Watching a movie", "Both take the same time", "Cannot say"], answer: "Watching a movie" },
        { question: "What day comes after Friday?", options: ["Thursday", "Sunday", "Monday", "Saturday"], answer: "Saturday" },
        { question: "We have lunch in the ___.", options: ["Morning", "Night", "Afternoon", "Midnight"], answer: "Afternoon" }
      ]
    },
    "Measurement": {
      content: `<h3><strong>Main focus: Measuring without a ruler — Taller/Shorter, Heavier/Lighter</strong></h3>
<p><strong>Chapter summary:</strong> We can measure things without a ruler by using our <strong>Handspan</strong> (thumb to pinky), <strong>Footsteps</strong>, or a <strong>String</strong>. We compare things using: <strong>Taller / Shorter</strong> (for height), <strong>Heavier / Lighter</strong> (for weight), and <strong>Thicker / Thinner</strong> (for width). We also measure capacity: how many glasses fill a bottle?</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Handspan</strong> = distance from thumb to little finger</li>
<li>Compare height: Taller / Shorter</li>
<li>Compare weight: Heavier / Lighter</li>
<li>Compare width: Thicker / Thinner</li>
<li>Capacity: how many small cups fill a large container</li>
</ul>`,
      quiz: [
        { question: "Which is HEAVIER: a spoon or a bucket of water?", options: ["A spoon", "A bucket of water", "Both are equal", "Cannot say"], answer: "A bucket of water" },
        { question: "We can measure the length of a table using our ___.", options: ["Eyes", "Handspan", "Voice", "Colour"], answer: "Handspan" },
        { question: "Is a thread THINNER or THICKER than a rope?", options: ["Thicker", "Thinner", "Same width", "Cannot compare"], answer: "Thinner" },
        { question: "To compare the heights of two children, we use which words?", options: ["Heavier / Lighter", "Thicker / Thinner", "Taller / Shorter", "Near / Far"], answer: "Taller / Shorter" },
        { question: "We measure length without a ruler using ___.", options: ["A coin", "Footsteps", "A ball", "Water"], answer: "Footsteps" }
      ]
    },
    "Numbers from Twenty-One to Fifty": {
      content: `<h3><strong>Main focus: Numbers 21–99 as bundles of Tens and Ones</strong></h3>
<p><strong>Chapter summary:</strong> Numbers 21 to 99 are just more bundles of Tens! 30 = 3 Tens, 54 = 5 Tens + 4 Ones, 99 = 9 Tens + 9 Ones. To compare two numbers, always look at the <strong>Tens digit first</strong>. 52 is bigger than 25 because 5 Tens > 2 Tens. We also learn to count by tens: 10, 20, 30, 40…</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>30 = 3 Tens + 0 Ones; 54 = 5 Tens + 4 Ones</li>
<li>To compare numbers, look at the <strong>Tens digit first</strong></li>
<li>Count by tens: 10, 20, 30, 40, 50, 60, 70, 80, 90</li>
<li>Number name for 50 = <strong>Fifty</strong></li>
</ul>`,
      quiz: [
        { question: "What is the number for 7 Tens and 2 Ones?", options: ["27", "72", "720", "207"], answer: "72" },
        { question: "Which is bigger: 48 or 84?", options: ["48", "84", "Both are equal", "Cannot say"], answer: "84" },
        { question: "Count by tens: 10, 20, 30, ___, ___, 60. What are the missing numbers?", options: ["35, 50", "40, 50", "31, 41", "45, 55"], answer: "40, 50" },
        { question: "What is the number name for 50?", options: ["Fifteen", "Five", "Sixty", "Fifty"], answer: "Fifty" },
        { question: "What number comes between 66 and 68?", options: ["65", "69", "67", "70"], answer: "67" }
      ]
    },
    "Data Handling": {
      content: `<h3><strong>Main focus: Sorting, counting, and comparing groups of objects</strong></h3>
<p><strong>Chapter summary:</strong> Data handling is <strong>sorting and counting</strong>. If you have a pile of toys, you count how many cars, how many dolls, and how many balls. Then you can answer: "Which toy do I have the most of?" and "Which is the least?" Sorting helps us organise the world around us.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Sort</strong> = putting similar things together in groups</li>
<li><strong>Count</strong> each group to find how many</li>
<li>Compare groups: <strong>Most / Least</strong></li>
<li>We can sort toys, fruits, colours, shapes, and more</li>
</ul>`,
      quiz: [
        { question: "There are 5 red cars and 2 blue cars. Which colour car is more?", options: ["Blue", "Red", "Both are same", "Cannot say"], answer: "Red" },
        { question: "Data handling means:", options: ["Adding big numbers", "Sorting and counting objects in groups", "Drawing shapes", "Measuring length"], answer: "Sorting and counting objects in groups" },
        { question: "In the word MATHEMATICS, which letter appears the most?", options: ["M", "T", "A", "E"], answer: "A" },
        { question: "You have 4 stars, 2 circles, and 4 stars again. How many stars are there in total?", options: ["6", "4", "8", "10"], answer: "8" },
        { question: "Why do we sort and count things into groups?", options: ["To make them look pretty", "To answer questions like which is most or least", "To make them bigger", "To subtract them"], answer: "To answer questions like which is most or least" }
      ]
    },
    "Patterns": {
      content: `<h3><strong>Main focus: Recognising and continuing repeating patterns</strong></h3>
<p><strong>Chapter summary:</strong> A pattern is a <strong>rule that repeats</strong>. It is like a dance: Step, Clap, Step, Clap. In maths we look for what comes next. If the pattern is 2, 4, 2, 4 — the next number must be 2. If it is square, triangle, square, triangle — the next shape is a square. Patterns are everywhere: on your clothes, on floor tiles, and in numbers!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>A pattern has a <strong>repeating rule</strong></li>
<li>Colour patterns: Red, Blue, Red, Blue…</li>
<li>Shape patterns: ◻ △ ◻ △ …</li>
<li>Number patterns: 5, 10, 15, 20 (counting by 5s); 2, 4, 6, 8 (counting by 2s)</li>
</ul>`,
      quiz: [
        { question: "Complete this pattern: A, B, A, B, ___, ___", options: ["B, A", "A, B", "A, A", "B, B"], answer: "A, B" },
        { question: "What is the rule for: 5, 10, 15, 20, 25?", options: ["Add 2 each time", "Add 10 each time", "Add 5 each time", "Add 3 each time"], answer: "Add 5 each time" },
        { question: "Pattern: ◻ △ ◻ △ ___. What comes next?", options: ["△", "◻", "○", "★"], answer: "◻" },
        { question: "The pattern is: Sun, Moon, Star, Sun, Moon, ___. What comes next?", options: ["Sun", "Moon", "Star", "Cloud"], answer: "Star" },
        { question: "Which of these is a number pattern counting by 2s?", options: ["1, 3, 5, 7", "2, 4, 6, 8", "5, 10, 15, 20", "10, 20, 30, 40"], answer: "2, 4, 6, 8" }
      ]
    },
    "All About Me": {
      content: `<h3><strong>Main focus: Self-introduction and identity</strong></h3>
<p><strong>Chapter summary:</strong> Every person is special and unique! This chapter helps you introduce yourself. You learn about your name, your age, your favorite things (hobbies), and your birthday. Knowing yourself is the first step to knowing the world.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Introducing yourself: "My name is...", "I am ... years old"</li>
<li>Knowing your birthday and age</li>
<li>Identifying hobbies and things you love</li>
<li>Knowing physical traits (hair and eye color)</li>
</ul>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>Write three things you love to do (Example: Drawing, playing, singing).</li>
<li>When do you celebrate your birthday?</li>
<li>How many candles were on your last birthday cake?</li>
<li>What is the color of your hair and eyes?</li>
<li>Draw a picture of yourself doing something you love.</li>
</ul>`,
      quiz: [
        { question: "What is the first step to knowing the world?", options: ["Knowing your name", "Knowing yourself", "Knowing your teacher", "Knowing your toys"], answer: "Knowing yourself" },
        { question: "What do we use to celebrate our birthday?", options: ["Books", "Candles and cake", "Pens", "Shoes"], answer: "Candles and cake" },
        { question: "Which of these is a hobby?", options: ["Sleeping in class", "Drawing and singing", "Crying", "Breaking toys"], answer: "Drawing and singing" },
        { question: "How many candles would be on your cake if you are 6 years old?", options: ["4", "5", "6", "7"], answer: "6" },
        { question: "Every person is ___ and unique.", options: ["Same", "Bored", "Special", "Common"], answer: "Special" },
        { question: "What color can your eyes be?", options: ["Blue or Brown", "Purple", "Pink", "Silver"], answer: "Blue or Brown" },
        { question: "Things we love to do in free time are called ___.", options: ["Work", "Hobbies", "Sleep", "Chores"], answer: "Hobbies" },
        { question: "Your name is your ___.", options: ["Identity", "Secret", "Number", "Grade"], answer: "Identity" },
        { question: "We celebrate our birthday ___ a year.", options: ["Once", "Twice", "Every month", "Never"], answer: "Once" },
        { question: "Everyone has a ___ hair and eye color.", options: ["Same", "Different", "Invisible", "Grey"], answer: "Different" }
      ],
      lessons: [
        { 
          title: "My Name & Identity", 
          explanation: "Every person is special and unique! This chapter helps you introduce yourself. The first step to knowing the world is knowing who you are. Your name is your identity, and no one else is exactly like you.", 
          words: ["Name", "Special", "Unique", "Identity", "Self", "Student"],
          activities: "Write your full name in big letters. Decorate it with your favorite colors!"
        },
        { 
          title: "My Age & Birthday", 
          explanation: "Your birthday is a very special day! We use candles on a cake to show how many years old we are. Growing older means you can do more things by yourself and learn more about the world.", 
          words: ["Birthday", "Age", "Candles", "Celebrate", "Cake", "Years"],
          activities: "When do you celebrate your birthday? How many candles were on your last birthday cake? Draw the cake with the right number of candles."
        },
        { 
          title: "My Favorite Things", 
          explanation: "We all have things we like more than others. These can be toys, colors, foods, or animals. Knowing what you like helps you share your feelings with your friends and family.", 
          words: ["Favorite", "Toy", "Color", "Choice", "Like", "Loves"],
          activities: "What is your favorite color? Find three things in your room that are that color."
        },
        { 
          title: "My Hobbies", 
          explanation: "Hobbies are activities we love to do in our free time, like drawing, singing, playing, or reading. Doing things you love makes you a happy and special person.", 
          words: ["Hobbies", "Drawing", "Singing", "Playing", "Free time", "Fun"],
          activities: "Write three things you love to do (Example: Drawing, playing, singing). Draw a picture of yourself doing something you love."
        },
        { 
          title: "My Physical Traits", 
          explanation: "Everyone looks different and that is what makes us beautiful! We have different hair colors, eye colors, and heights. Knowing your own traits is part of knowing yourself.", 
          words: ["Hair", "Eyes", "Traits", "Appearance", "Color", "Brown", "Black"],
          activities: "Look in the mirror. What is the color of your hair and eyes? Is your hair long or short?"
        },
        { 
          title: "Review: All About Me", 
          explanation: "Now you know how to introduce yourself and share all the special things about you! You are a unique individual with your own favorites, hobbies, and features.", 
          words: ["Introduction", "Special", "Unique", "Friend", "Myself", "Identify"],
          activities: "Stand up and introduce yourself to an imaginary friend. Say your name, your age, and one thing you love to do!"
        }
      ]
    },
    "My Body and Sense Organs": {
      content: `<h3><strong>Main focus: Body parts and the 5 senses</strong></h3>
<p><strong>Chapter summary:</strong> Your body is like a wonderful machine with different parts. But your "Superpowers" are your 5 Sense Organs. They help you know what is happening around you:</p>
<ul>
<li><strong>Eyes:</strong> To see colors and shapes</li>
<li><strong>Ears:</strong> To hear music and voices</li>
<li><strong>Nose:</strong> To smell flowers and food</li>
<li><strong>Tongue:</strong> To taste sweet, salty, or sour</li>
<li><strong>Skin:</strong> To feel hot, cold, soft, or prickly</li>
</ul>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>Which sense organ helps you know that a bell is ringing?</li>
<li>How many toes do you have in total?</li>
<li>Match the following:
  <ul>
    <li>Ice cream → (Eyes / Tongue)</li>
    <li>Rainbow → (Nose / Eyes)</li>
    <li>Soft Teddy Bear → (Skin / Ears)</li>
  </ul>
</li>
<li>What part of your body helps you run and jump?</li>
<li>True or False: We have two noses.</li>
</ul>`,
      quiz: [
        { question: "Which sense organ helps you know that a bell is ringing?", options: ["Nose", "Eyes", "Ears", "Tongue"], answer: "Ears" },
        { question: "How many toes do humans usually have in total?", options: ["5", "8", "10", "12"], answer: "10" },
        { question: "Which organ helps you taste an ice cream?", options: ["Skin", "Tongue", "Nose", "Ears"], answer: "Tongue" },
        { question: "We use our ___ to feel if a teddy bear is soft.", options: ["Eyes", "Ears", "Nose", "Skin"], answer: "Skin" },
        { question: "True or False: We have two noses.", options: ["True", "False"], answer: "False" }
      ],
      lessons: [
        { title: "My Wonderful Body", explanation: "Your body is like a wonderful machine with many parts that work together to help you move and play.", words: ["Body", "Machine", "Parts", "Movement"] },
        { title: "Seeing & Hearing", explanation: "Our eyes help us see colors and shapes. Our ears help us hear music, voices, and bells.", words: ["Eyes", "Ears", "See", "Hear"] },
        { title: "Smelling & Tasting", explanation: "Our nose helps us smell flowers and yummy food. Our tongue helps us taste sweet, salty, and sour things.", words: ["Nose", "Tongue", "Smell", "Taste"] },
        { title: "Feeling with Skin", explanation: "Our skin is all over our body. it helps us feel if something is hot, cold, soft, or prickly.", words: ["Skin", "Feel", "Touch", "Temperature"] },
        { title: "Action Words", explanation: "Our body parts help us do actions. We use legs to run and jump, and hands to clap and write.", words: ["Run", "Jump", "Clap", "Write", "Walk"] },
        { title: "The 5 Sense Organs", explanation: "Remember your 5 superpowers! Eyes, Ears, Nose, Tongue, and Skin help you know everything about the world.", words: ["Senses", "Organs", "Superpower", "Knowledge"] }
      ]
    },
    "My Family and Home": {
      content: `<h3><strong>Main focus: Types of families and rooms in a home</strong></h3>
<p><strong>Chapter summary:</strong> A family is a group of people who live together and care for each other.</p>
<ul>
<li><strong>Small Family:</strong> Mother, Father, and one or two children.</li>
<li><strong>Large/Joint Family:</strong> Grandparents, Uncles, Aunts, and Cousins all living together.</li>
</ul>
<p>Your home is the place where you feel safe. Every room has a use: the <strong>Kitchen</strong> for cooking, the <strong>Bedroom</strong> for sleeping, and the <strong>Bathroom</strong> for cleaning up.</p>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>Who are your parents? (Your Mother and Father).</li>
<li>What do you call your father’s father?</li>
<li>In which room does your mother cook food?</li>
<li>How do you help your family at home? (Example: Keeping toys in place).</li>
<li>Name one thing you do with your family on holidays.</li>
</ul>`,
      quiz: [
        { question: "Who are your parents?", options: ["Grandparents", "Mother and Father", "Uncles and Aunts", "Friends"], answer: "Mother and Father" },
        { question: "What do you call your father's father?", options: ["Brother", "Uncle", "Grandfather", "Cousin"], answer: "Grandfather" },
        { question: "In which room does your mother cook food?", options: ["Bedroom", "Bathroom", "Kitchen", "Drawing room"], answer: "Kitchen" },
        { question: "Helping your family means ___.", options: ["Leaving toys on floor", "Keeping toys in place", "Shouting", "Not eating"], answer: "Keeping toys in place" },
        { question: "A family is a group of people who ___.", options: ["Live together and care", "Only fight", "Never talk", "Stay far away"], answer: "Live together and care" }
      ],
      lessons: [
        { title: "What is a Family?", explanation: "A family is a group of people who live together and care for each other. They love and support you. Your family is your biggest team, helping you when you are sad and celebrating with you when you are happy. You learn how to speak, how to eat, and how to be a good person from your family members. Even if your family is small or big, the most important part is the love and care you share every single day.", words: ["Family", "Love", "Care", "Together", "Support", "Team"], activities: "Draw a picture of your family. Who is in it? Give each person a big smile in your drawing." },
        { title: "Small Family", explanation: "A small family has a Mother, Father, and one or two children. It is also called a nuclear family. In a small family, you often get to do many fun things together, like going to the park, reading books, or helping in the kitchen. Everyone helps each other to keep the home happy and organized. It is a cozy place where you grow up feeling safe and very loved by your parents.", words: ["Small", "Parents", "Children", "Nuclear", "Cozy", "Happy"], activities: "What is one thing you like doing with your parents? Share it with your class." },
        { title: "Large/Joint Family", explanation: "A joint family is big and wonderful! It includes grandparents, uncles, aunts, and cousins all living in one home. Living in a joint family means there is always someone to play with or talk to. You learn to share your toys, your stories, and your snacks. You get lots of love from your grandparents and have great fun with your cousins. It is a busy and joyful house where everyone works together to help each other.", words: ["Large", "Joint", "Relatives", "Cousins", "Joyful", "Sharing"], activities: "How many people are in your family? Ask your parents for all their names and write them down." },
        { title: "Our Home & Safety", explanation: "Our home is the place where we feel safe. It protects us from rain, sun, cold weather, and wild animals. A home is not just four walls and a roof; it is the place where you share meals, play games, and sleep peacefully. Because our home protects us, we should also take care of it by keeping it clean and beautiful. A clean home is a healthy and happy home for everyone who lives inside it.", words: ["Home", "Safe", "Protect", "Shelter", "Clean", "Peaceful"], activities: "Why is a home important? Think of two reasons and tell your partner." },
        { title: "Rooms in a Home", explanation: "Every room has a special use. We cook in the kitchen, sleep in the bedroom, and bathe in the bathroom. The living room is where we sit with guests and talk. The dining room is where we eat our meals together. Knowing which room is for which activity helps us stay organized. When we are done playing, we should put our toys back in the room they belong to. Keeping rooms tidy makes our house feel even better!", words: ["Kitchen", "Bedroom", "Bathroom", "Living room", "Dining room", "Tidy"], activities: "Go on a tour of your home. Name the rooms you walk through. What is the most important activity in each room?" },
        { title: "Helping at Home", explanation: "We should help our family by keeping our toys in place and keeping our home clean. Helping makes you a responsible member of the family! You can help by putting your plate in the sink, folding your clothes, or dusting the shelves. When everyone helps, the work gets done quickly and everyone has more time to play and relax together. Helping is a way to say 'I love you' to your family members.", words: ["Help", "Clean", "Toys", "Responsible", "Work", "Relax"], activities: "Choose one small job you can do to help at home today. Did your parents say thank you?" }
      ]
    },
    "Food We Eat": {
      content: `<h3><strong>Main focus: Sources of food and healthy habits</strong></h3>
<p><strong>Detailed explanation:</strong> Food is the basic necessity for all living beings. It provides the energy required for various activities like playing, studying, and growing. We get our food from two main sources: plants and animals. Plants provide us with fruits, vegetables, pulses, and cereals. Animals provide us with milk, eggs, and meat. It is important to eat a balanced diet that includes a variety of foods to stay healthy. We should also follow good eating habits, such as washing hands before and after meals, eating slowly, and not wasting food. Drinking plenty of water is also essential for our body to function properly.</p>
<h3><strong>Grammar focus:</strong></h3>
<ul>
<li><strong>Healthy food:</strong> fruits, vegetables, milk</li>
<li><strong>Junk food:</strong> chips, burgers, cold drinks</li>
<li><strong>Meals:</strong> breakfast, lunch, dinner</li>
</ul>
<h3><strong>Activities:</strong></h3>
<ul>
<li>Make a list of foods you ate yesterday and categorize them.</li>
<li>Draw your favorite fruit and vegetable.</li>
<li>Identify which foods come from plants and which from animals.</li>
</ul>`,
      quiz: [
        { question: "Why do we need food?", options: ["To sleep", "To get energy and grow", "To cry", "To watch TV"], answer: "To get energy and grow" },
        { question: "Which of these do we get from plants?", options: ["Milk", "Eggs", "Fruits and Vegetables", "Meat"], answer: "Fruits and Vegetables" },
        { question: "Which is a healthy snack?", options: ["Burger", "Chips", "Apple", "Cold drink"], answer: "Apple" },
        { question: "How many main meals do we usually eat in a day?", options: ["1", "2", "3", "5"], answer: "3" },
        { question: "We should wash our hands ___ eating.", options: ["Only before", "Only after", "Before and after", "Never"], answer: "Before and after" },
        { question: "Which of these gives us energy?", options: ["Sleeping", "Food", "Crying", "Sitting"], answer: "Food" },
        { question: "Which meal do we eat in the morning?", options: ["Lunch", "Dinner", "Breakfast", "Snack"], answer: "Breakfast" },
        { question: "Fruits and vegetables keep us ___.", options: ["Weak", "Sick", "Healthy", "Tired"], answer: "Healthy" },
        { question: "We should ___ our food well.", options: ["Gulp", "Chew", "Drink", "Throw"], answer: "Chew" },
        { question: "Milk comes from ___.", options: ["Plants", "Animals", "Clouds", "Rivers"], answer: "Animals" }
      ],
      lessons: [
        { title: "Why We Need Food", explanation: "Food is like fuel for our body! Just like a car needs petrol to run, our body needs food to play, run, and think. When we eat good food, our body gets energy. Energy is what helps us jump high and run fast. Without food, we would feel very tired and weak. Food also helps us grow from a small baby into a big child. It builds our muscles and makes our bones strong. So, eating is not just for fun, it's for staying alive and growing big!", words: ["Energy", "Grow", "Strong", "Alive", "Fuel", "Health"], activities: "Jump up and down 10 times. How do you feel? You need energy for that! Draw a picture of one food that gives you energy." },
        { title: "Food from Plants", explanation: "Plants are amazing because they make food for us! When we walk in a garden or a farm, we see many plants. Some give us sweet fruits like mangoes, apples, and bananas. Others give us healthy vegetables like carrots, potatoes, and spinach. We also get grains like rice and wheat from plants, which we use to make chapatis and bread. Pulses like dal also come from plants. Nature is very kind to give us so many different things to eat from the soil!", words: ["Plants", "Fruits", "Vegetables", "Grains", "Pulses", "Nature"], activities: "Look in your kitchen. Find one fruit and one vegetable. Touch them and feel their skin. Are they smooth or rough?" },
        { title: "Food from Animals", explanation: "Animals are also our friends who give us food. Cows, buffaloes, and goats give us fresh milk. We use milk to make many yummy things like curd, butter, and cheese. Hens and ducks give us eggs, which are very good for our health. Some people also eat meat from animals like goats or fish. Drinking a glass of milk every day makes our teeth and bones very strong because milk has something called calcium. It is important to be kind to animals who help us!", words: ["Animals", "Milk", "Eggs", "Meat", "Curd", "Calcium"], activities: "Do you like drinking milk? Name three things your mother makes using milk (like curd, kheer, or paneer)." },
        { title: "Healthy vs Junk Food", explanation: "Not all food is the same! Some food is 'Healthy' and some is 'Junk'. Healthy food like milk, fruits, green veggies, and dal makes us super strong and protects us from falling sick. It has vitamins and minerals. Junk food like chips, burgers, and sugary cold drinks might taste good, but it doesn't help our body grow. If we eat too much junk food, we might feel lazy or get a tummy ache. It's okay to have a treat sometimes, but most of the time, we should choose healthy food to be a champion!", words: ["Healthy", "Junk", "Nutrition", "Vitamins", "Minerals", "Champion"], activities: "Imagine you are a superhero. Which food would you eat to get your powers? Draw a 'Healthy Hero Meal' on a paper plate." },
        { title: "Our Daily Meals", explanation: "We have a routine for eating! We usually eat three main meals. In the morning, we have Breakfast to start our day with energy. In the middle of the day, when we come back from school, we have Lunch. And at night, before we go to sleep, we have Dinner with our whole family. Sometimes we have a small snack in the evening too. Eating at the right time helps our tummy stay happy and our body work perfectly throughout the day.", words: ["Breakfast", "Lunch", "Dinner", "Meals", "Morning", "Night"], activities: "What did you eat for breakfast today? Ask your mother what is for dinner tonight. Try to help her set the table!" },
        { title: "Food Hygiene", explanation: "Staying clean while eating is very important! We should always wash our hands with soap before we touch our food, and wash them again after we finish. This keeps away the tiny germs that can make us sick. We should also wash fruits and vegetables before eating them. While eating, we should sit properly, chew our food slowly, and not talk with food in our mouth. Also, remember never to waste food, because many people work hard to grow it for us!", words: ["Hygiene", "Wash", "Chew", "Cleanliness", "Germs", "Soap", "Waste"], activities: "Practice washing your hands the right way for 20 seconds. Count to 20 while you scrub with soap!" }
      ]
    },
    "Shapes and Space": {
      content: "<h3><strong>Main focus: Spatial understanding and basic shapes</strong></h3>\
<p><strong>Detailed explanation:</strong> This chapter introduces children to the world of shapes and their positions in space. It covers concepts like inside-outside, bigger-smaller, top-bottom, nearer-farther, on-under, and above-below. Understanding these positions helps children describe the world around them. The chapter also introduces basic 2D shapes like circles, triangles, and squares through everyday objects. By observing objects, children learn to identify their shapes and relative positions.</p>\
<h3><strong>Key Concepts:</strong></h3>\
<ul>\
<li><strong>Positions:</strong> inside, outside, top, bottom, near, far</li>\
<li><strong>Comparisons:</strong> bigger, smaller, longest, shortest</li>\
<li><strong>Basic shapes:</strong> circle, triangle, square, rectangle</li>\
</ul>",
      quiz: [
        { question: "Where is the bird in the sky?", options: ["Under the tree", "Above the tree", "Inside the tree", "Near the tree"], answer: "Above the tree" },
        { question: "Which is bigger: An Elephant or a Mouse?", options: ["Elephant", "Mouse"], answer: "Elephant" },
        { question: "Where do we keep our books?", options: ["Inside the bag", "Outside the bag", "On top of the bag", "Under the bag"], answer: "Inside the bag" },
        { question: "A ball is which shape?", options: ["Triangle", "Square", "Circle", "Rectangle"], answer: "Circle" },
        { question: "The fan is ___ our head.", options: ["Under", "Above", "Inside", "Near"], answer: "Above" },
        { question: "Which is the shortest finger?", options: ["Thumb", "Pinky", "Middle", "Index"], answer: "Pinky" },
        { question: "If a cat is on the roof, it is at the ___.", options: ["Bottom", "Top", "Side", "Under"], answer: "Top" },
        { question: "Which shape has three sides?", options: ["Square", "Circle", "Triangle", "Rectangle"], answer: "Triangle" }
      ],
      lessons: [
        { title: "Inside and Outside", explanation: "Imagine you have a beautiful pencil box. When your pencils are inside the box, they are safe. When you take them out to write, they are outside. Just like you are inside your house when it rains, and outside when you play in the park. 'Inside' means something is within a container or space, and 'outside' means it is in the open space around it. Can you think of more things that stay inside and outside?", words: ["Inside", "Outside", "Box", "House", "Park", "Open"], activities: "Put your favorite toy inside a box. Now take it out. Say 'The toy is inside' and 'The toy is outside' out loud!" },
        { title: "Bigger and Smaller", explanation: "The world is full of things of different sizes! Some things are very big, like an elephant, a mountain, or a big bus. Some things are very small, like an ant, a pebble, or a tiny eraser. When we compare two things, we say one is 'bigger' and the other is 'smaller'. Look at your hand and your father's hand—which one is bigger? Look at a football and a tennis ball—which one is smaller? Size helps us identify things!", words: ["Bigger", "Smaller", "Elephant", "Ant", "Compare", "Size"], activities: "Find two spoons in your kitchen—a big one and a small one. Which one is bigger? Which one is smaller?" },
        { title: "Top and Bottom", explanation: "Look at a tall building or a tree. The part that touches the sky is the 'Top'. The part that touches the ground is the 'Bottom'. When you sit on a slide, you are at the top first, and then you slide down to the bottom. If you put a cap on your head, it is on the top of your body. Your shoes are at the bottom. Understanding top and bottom helps us find things!", words: ["Top", "Bottom", "Sky", "Ground", "Slide", "Height"], activities: "Put your hand on the top of your head. Now touch the bottom of your feet. Up and down!" },
        { title: "Nearer and Farther", explanation: "Distance tells us how close something is. If a ball is right next to you, it is 'Nearer'. If it is across the field, it is 'Farther'. If you are standing near your mother, you can hold her hand. If she is far away, you have to call her. We use these words to know how much we need to walk or reach for something. Which is nearer to you right now: your book or the door?", words: ["Nearer", "Farther", "Close", "Distance", "Reach", "Away"], activities: "Stand in the middle of the room. Point to something that is near you. Now point to something that is far away." },
        { title: "On, Under, Above, Below", explanation: "These words tell us exactly where things are! A cat can sit 'On' the table. A dog might sleep 'Under' the table. The fan is 'Above' your head, and the carpet is 'Below' your feet. 'Above' and 'Below' are like 'Top' and 'Bottom' but for things that might not be touching. 'On' and 'Under' are for things that are usually touching or very close. Is your ceiling fan above or below you?", words: ["On", "Under", "Above", "Below", "Position", "Locate"], activities: "Place a book on the table. Now put your hand under the table. Look up at the ceiling—it is above you!" },
        { title: "Shapes Around Us", explanation: "Look around! Everything has a shape. A clock is often a 'Circle'—it is round and round. A slice of pizza or a sandwich can be a 'Triangle' with three sharp corners. Your notebook or the door is a 'Rectangle' or a 'Square' with four sides. Shapes make the world look interesting! Can you find a circle in your room? How about a square window?", words: ["Circle", "Triangle", "Square", "Rectangle", "Corners", "Sides"], activities: "Take a piece of paper and try to draw a circle, a triangle, and a square. Color the circle red, the triangle blue, and the square green!" }
      ]
    },
    "Numbers from One to Nine": {
      content: "<h3><strong>Main focus: Counting and identifying numbers 1-9</strong></h3>\
<p><strong>Detailed explanation:</strong> Counting is the foundation of mathematics. This chapter teaches children to count objects up to nine. It involves matching objects with numbers, understanding the concept of 'more' and 'less', and learning to write the digits 1, 2, 3, 4, 5, 6, 7, 8, and 9. Children also learn the concept of zero (0) as 'nothing' or the absence of objects. Activities like counting fingers, fruits, and toys help reinforce these concepts.</p>\
<h3><strong>Key Concepts:</strong></h3>\
<ul>\
<li><strong>Counting:</strong> 1, 2, 3, 4, 5, 6, 7, 8, 9</li>\
<li><strong>Comparison:</strong> more than, less than, equal to</li>\
<li><strong>Zero:</strong> the concept of none</li>\
</ul>",
      quiz: [
        { question: "How many fingers do you have on one hand?", options: ["4", "5", "6", "10"], answer: "5" },
        { question: "Which number comes after 3?", options: ["2", "4", "5", "6"], answer: "4" },
        { question: "If you have 2 apples and you eat both, how many are left?", options: ["1", "2", "0", "3"], answer: "0" },
        { question: "Count the legs of a chair.", options: ["2", "3", "4", "5"], answer: "4" },
        { question: "Which number is greater: 7 or 4?", options: ["7", "4"], answer: "7" }
      ],
      lessons: [
        { title: "Counting 1 to 3", explanation: "Let's start counting! One (1) is like the Sun in the sky. Two (2) is like your two eyes or two ears. Three (3) is like the wheels on a rickshaw or the sides of a triangle. Counting is just saying numbers in order while pointing at things. One... Two... Three! Can you find three things on your table?", words: ["One", "Two", "Three", "Count", "Order", "Number"], activities: "Hold up one finger. Now two. Now three! Wiggle them around." },
        { title: "Counting 4 to 6", explanation: "Moving up! Four (4) is like the legs of a table or a dog. Five (5) is special because you have five fingers on one hand! Six (6) is the number of legs on an insect like an ant. As we count higher, the group of things gets bigger. 1, 2, 3, 4, 5, 6! It's like climbing stairs!", words: ["Four", "Five", "Six", "Higher", "Fingers", "Legs"], activities: "Clap your hands six times while counting out loud: 1, 2, 3, 4, 5, 6!" },
        { title: "Counting 7 to 9", explanation: "Almost at ten! Seven (7) is the number of colors in a rainbow. Eight (8) is the number of legs on a spider. Nine (9) is the biggest single-digit number! When you have nine of something, you have a lot! Counting to nine helps us talk about many things, like nine crayons in a box or nine stars in a drawing.", words: ["Seven", "Eight", "Nine", "Rainbow", "Spider", "Many"], activities: "Draw nine small circles on a paper and count them one by one as you color them." },
        { title: "More or Less", explanation: "When we compare two groups, we can see which one has 'More' and which has 'Less'. If you have 5 candies and your friend has 2, you have more! 'More' means a bigger number, and 'Less' means a smaller number. If both have the same number, we say it is 'Equal'. Understanding more and less helps us share things fairly.", words: ["More", "Less", "Equal", "Compare", "Group", "Share"], activities: "Put 3 pencils in one pile and 1 pencil in another. Which pile has more? Which has less?" },
        { title: "The Story of Zero", explanation: "What happens when you have a plate of cookies and you eat them ALL? Now you have 'Zero' (0) cookies! Zero means 'nothing' or 'none'. It is a very important number because it tells us when something is empty. If there are no birds in a tree, we say there are zero birds. Zero is round like a circle and represents an empty space.", words: ["Zero", "None", "Nothing", "Empty", "Round", "Space"], activities: "Close your hand into a fist. How many fingers are you holding up? Zero! Now open them one by one." },
        { title: "Review: Counting Fun", explanation: "Wow! You can now count from 0 all the way to 9. You can identify numbers and tell if a group is big or small. Numbers are everywhere—on houses, on phones, and even on your birthday cake. Keep practicing your counting every day by counting your steps or your toys!", words: ["Count", "Identify", "Practice", "Numbers", "Review", "Master"], activities: "Walk across the room and count every step you take. How many steps did it take to reach the other side?" }
      ]
    },
    "Addition": {
      content: "<h3><strong>Main focus: Combining groups of objects</strong></h3>\
<p><strong>Detailed explanation:</strong> Addition is the mathematical process of putting things together. When we add two or more numbers, we get a larger number called the 'Sum'. For example, if you have 2 balloons and your friend gives you 1 more, you now have 3 balloons in total. We use the plus sign (+) to show addition. This chapter uses pictures of fruits, animals, and toys to help children understand how to combine groups and find the total count.</p>\
<h3><strong>Key Concepts:</strong></h3>\
<ul>\
<li><strong>Plus sign (+):</strong> the symbol for adding</li>\
<li><strong>Equals sign (=):</strong> the symbol for the result</li>\
<li><strong>Total/Sum:</strong> the final count</li>\
</ul>",
      quiz: [
        { question: "What is 2 + 3?", options: ["4", "5", "6", "7"], answer: "5" },
        { question: "If you have 1 ball and buy 1 more, how many do you have?", options: ["1", "2", "3", "0"], answer: "2" },
        { question: "3 plus 0 equals ___.", options: ["0", "1", "2", "3"], answer: "3" },
        { question: "What is 4 + 4?", options: ["7", "8", "9", "10"], answer: "8" },
        { question: "One more than 5 is ___.", options: ["4", "5", "6", "7"], answer: "6" }
      ],
      lessons: [
        { title: "Adding One More", explanation: "Addition can be as simple as adding 'One More'. If you have 1 apple and you get 1 more, you have 2. If you have 5 and get 1 more, you have 6. It's like taking one step forward on a number line. Adding 1 always gives you the next number! Let's try: What is 8 and 1 more?", words: ["Add", "Plus", "Total", "More", "Next", "Step"], activities: "Put one toy on the table. Add one more. Count them: 1, 2! Addition is fun." },
        { title: "Combining Two Groups", explanation: "Addition is also about putting two different groups together. If there are 2 birds on a branch and 3 more fly in, we count them all together: 1, 2, 3, 4, 5! We write this as 2 + 3 = 5. The '+' sign is like a bridge that connects the two groups. The '=' sign tells us the final answer. Can you add 2 pens and 2 pencils?", words: ["Groups", "Combine", "Bridge", "Together", "Sum", "Plus"], activities: "Use your fingers. Show 2 on one hand and 3 on the other. Put them together and count all of them." },
        { title: "Addition with Zero", explanation: "Adding zero is a special trick! Zero means nothing. So, if you have 4 chocolates and you get 0 more, you still have 4 chocolates. The number doesn't change at all! Any number plus zero is always that same number. 5 + 0 = 5. 9 + 0 = 9. It's like adding an empty box—the count stays the same.", words: ["Zero", "Same", "No change", "Empty", "Rule", "Trick"], activities: "Hold up 5 fingers. Add zero more fingers (keep your other hand closed). How many fingers now? Still 5!" },
        { title: "Addition Stories", explanation: "We can use addition to tell stories! 'Rahul has 3 balls. Sarah gives him 2 more. How many balls does Rahul have now?' These are called word problems. We look for words like 'total', 'altogether', or 'sum' to know we need to add. Stories make math feel real and useful. Can you make up an addition story about your toys?", words: ["Stories", "Total", "Altogether", "Problem", "Real", "Math"], activities: "Tell a story: 'I have 2 cookies. My dad gives me 1 more. I have 3 cookies!' Now you try one." },
        { title: "Horizontal & Vertical Addition", explanation: "We can write addition in two ways! Horizontal is like a sentence: 2 + 2 = 4. Vertical is when we write numbers one below the other with a line at the bottom. Both ways give the same answer! Vertical addition is very helpful when we start adding bigger numbers later on. It's like stacking blocks—one on top of the other.", words: ["Horizontal", "Vertical", "Stack", "Line", "Below", "Ways"], activities: "Write '3 + 1 = 4' on a piece of paper. Now try writing the 3 on top of the 1 with a plus sign. Does it look different?" },
        { title: "Review: Addition Master", explanation: "Congratulations! You are now an Addition Master. You know how to combine groups, add zero, and tell addition stories. Adding helps us in shops, in games, and even when we share snacks with friends. Keep looking for things to add together everywhere you go!", words: ["Master", "Combine", "Addition", "Practice", "Review", "Skills"], activities: "Find two groups of objects (like 4 spoons and 2 forks). Add them together. What is the total count?" }
      ]
    },
    "Plants Around Us": {
      content: `<h3><strong>Main focus: Types of plants and their parts</strong></h3>
<p><strong>Chapter summary:</strong> Plants are our green friends. They can be:</p>
<ul>
<li><strong>Big Trees:</strong> Like Mango or Banyan.</li>
<li><strong>Small Shrubs:</strong> Like Rose or Tulsi.</li>
<li><strong>Climbers:</strong> Plants that need support to grow up, like money plants.</li>
</ul>
<p>Most plants have <strong>Leaves</strong> (usually green), <strong>Flowers</strong>, and <strong>Fruits</strong>. They need sunlight, water, and soil to live.</p>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>What does a plant need to grow?</li>
<li>Name a tree that gives us fruit.</li>
<li>Which part of the plant stays under the ground? (Roots).</li>
<li>Can plants move from one place to another like us?</li>
<li>Draw a leaf and color it.</li>
</ul>`,
      quiz: [
        { question: "What does a plant need to grow?", options: ["Chocolate", "Sunlight, water, and soil", "Television", "Plastic"], answer: "Sunlight, water, and soil" },
        { question: "Which part of the plant stays under the ground?", options: ["Flower", "Leaf", "Roots", "Fruit"], answer: "Roots" },
        { question: "Which of these is a big tree?", options: ["Rose", "Money plant", "Banyan", "Grass"], answer: "Banyan" },
        { question: "Can plants move from one place to another like us?", options: ["Yes", "No"], answer: "No" },
        { question: "Plants that need support to grow up are called ___.", options: ["Trees", "Shrubs", "Climbers", "Herbs"], answer: "Climbers" }
      ],
      topics: ["Plants are Our Friends", "Big Trees and Small Shrubs", "Climbers", "Parts of a Plant"]
    },
    "Animals Around Us": {
      content: `<h3><strong>Main focus: Classification of animals</strong></h3>
<p><strong>Chapter summary:</strong> The world is full of different animals:</p>
<ul>
<li><strong>Wild Animals:</strong> Live in the jungle (Lion, Elephant).</li>
<li><strong>Domestic/Farm Animals:</strong> Live with us or on farms (Cow, Goat, Hen).</li>
<li><strong>Pet Animals:</strong> Our friends at home (Dog, Cat, Rabbit).</li>
<li><strong>Birds:</strong> Have feathers and wings to fly.</li>
<li><strong>Insects:</strong> Very small animals with 6 legs (Ant, Butterfly).</li>
</ul>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>Name an animal that gives us milk.</li>
<li>Which animal is called the "King of the Jungle"?</li>
<li>How many legs does an insect have?</li>
<li>Name a bird that cannot fly but can run fast. (Ostrich / Penguin).</li>
<li>Which animal guards our house?</li>
</ul>`,
      quiz: [
        { question: "Which animal is called the 'King of the Jungle'?", options: ["Elephant", "Lion", "Tiger", "Giraffe"], answer: "Lion" },
        { question: "How many legs does an insect usually have?", options: ["2", "4", "6", "8"], answer: "6" },
        { question: "Which animal gives us milk?", options: ["Dog", "Cow", "Lion", "Cat"], answer: "Cow" },
        { question: "Which animal guards our house?", options: ["Cat", "Rabbit", "Dog", "Hen"], answer: "Dog" },
        { question: "A bird that cannot fly but runs fast is the ___.", options: ["Parrot", "Sparrow", "Ostrich", "Crow"], answer: "Ostrich" }
      ],
      topics: ["Wild Animals", "Domestic and Farm Animals", "Pet Animals", "Birds and Insects"]
    },
    "Water and Air": {
      content: `<h3><strong>Main focus: Importance of air and water</strong></h3>
<p><strong>Air:</strong> It is all around us. We cannot see it, but we can feel it when it moves (<strong>Wind</strong>). All living things need air to breathe.</p>
<p><strong>Water:</strong> We need it for drinking, bathing, cooking, and cleaning. Plants and animals need it too. We should never waste water!</p>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>Can we see air?</li>
<li>Write two uses of water.</li>
<li>Where does rain water go?</li>
<li>Fill in the blank: Moving air is called __________.</li>
<li>How can you save water at home?</li>
</ul>`,
      quiz: [
        { question: "Can we see air?", options: ["Yes", "No"], answer: "No" },
        { question: "Moving air is called ___.", options: ["Water", "Cloud", "Wind", "Dust"], answer: "Wind" },
        { question: "Which of these is NOT a use of water?", options: ["Drinking", "Bathing", "Watching TV", "Cooking"], answer: "Watching TV" },
        { question: "Where does rain water go?", options: ["Into the sky", "Into rivers and lakes", "Nowhere", "Into the fire"], answer: "Into rivers and lakes" },
        { question: "We should ___ water at home.", options: ["Waste", "Throw", "Save", "Hide"], answer: "Save" }
      ],
      topics: ["Air is All Around Us", "Breathing Air", "Uses of Water", "Saving Water"]
    },
    "People Who Help Us": {
      content: `<h3><strong>Main focus: Community helpers in our neighborhood</strong></h3>
<p><strong>Chapter summary:</strong> We cannot do everything by ourselves. Many people in our neighborhood help us:</p>
<ul>
<li><strong>Doctor:</strong> Treats us when we are sick.</li>
<li><strong>Teacher:</strong> Helps us learn at school.</li>
<li><strong>Postman:</strong> Brings our letters.</li>
<li><strong>Police Officer:</strong> Keeps us safe.</li>
<li><strong>Farmer:</strong> Grows food for us.</li>
</ul>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>Who mends our shoes? (Cobbler).</li>
<li>Where do you go when you are sick?</li>
<li>Who brings bread and milk to your house?</li>
<li>Who uses a whistle and a baton to keep us safe?</li>
<li>What does a tailor do?</li>
</ul>`,
      quiz: [
        { question: "Who mends our shoes when they are torn?", options: ["Tailor", "Doctor", "Cobbler", "Postman"], answer: "Cobbler" },
        { question: "Where do you go when you are sick?", options: ["Park", "Hospital/Doctor", "School", "Market"], answer: "Hospital/Doctor" },
        { question: "Who brings bread and milk to your house?", options: ["Policeman", "Tailor", "Milkman/Baker", "Barber"], answer: "Milkman/Baker" },
        { question: "Who uses a whistle and a baton to keep us safe?", options: ["Farmer", "Police Officer", "Teacher", "Doctor"], answer: "Police Officer" },
        { question: "What does a tailor do?", options: ["Grows crops", "Stitches clothes", "Fixes taps", "Bakes bread"], answer: "Stitches clothes" }
      ],
      topics: ["Who is a Neighbor?", "People who Help Us", "Our Neighborhood Places"]
    },
    "Good Habits and Safety": {
      content: `<h3><strong>Main focus: Good manners and personal safety</strong></h3>
<p><strong>Chapter summary:</strong> Being a "Good Child" means having good habits: brushing twice a day, sleeping on time, and saying "Please" and "Thank You."</p>
<p><strong>Safety means staying away from danger:</strong></p>
<ul>
<li><strong>On the Road:</strong> Cross at the Zebra Crossing. Follow the traffic lights.</li>
<li><strong>At Home:</strong> Do not touch sharp knives or electric plugs.</li>
</ul>
<h3><strong>Practice Questions:</strong></h3>
<ul>
<li>What does the Red light say?</li>
<li>Where should we walk on the road? (Footpath).</li>
<li>Is it safe to play with fire or matchsticks?</li>
<li>Write two "Magic Words" (Example: Sorry, Thank you).</li>
<li>Why should we trim our nails regularly?</li>
</ul>`,
      quiz: [
        { question: "What does the Red traffic light say?", options: ["Go", "Wait", "Stop", "Run"], answer: "Stop" },
        { question: "Where should we walk on the road?", options: ["In the middle", "On the footpath", "Anywhere", "Close your eyes"], answer: "On the footpath" },
        { question: "Which of these is a 'Magic Word'?", options: ["Give me", "Stop", "Thank you", "Go away"], answer: "Thank you" },
        { question: "Is it safe to play with matchsticks?", options: ["Yes", "No"], answer: "No" },
        { question: "Why should we trim our nails regularly?", options: ["To look scary", "To keep them clean and avoid germs", "To play better", "To waste time"], answer: "To keep them clean and avoid germs" }
      ],
      topics: ["Good Habits", "Road Safety", "Safety at Home", "Magic Words"]
    },
    "First Day at School": {
      content: `<h3><strong>Main focus: Feelings and imagination on the first day of school</strong></h3>
<p><strong>Chapter summary:</strong> A young child wonders about many things on their first day at school. Will their drawing be as good as others? Will the other children like them or just stare? Will the teacher look like their Mom or Grandmom? And most importantly, will their puppy wonder where they are? This poem captures the <strong>curiosity</strong> and <strong>nervousness</strong> we all feel when starting something new.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Wonder, stare, puppy, teacher, drawing</li>
<li>Expressing feelings: Nervousness and excitement</li>
<li>Rhyming words: Day/Stay, Look/Book</li>
<li>Using "I wonder..." to express curiosity</li>
</ul>`,
      quiz: [
        { question: "What does the child wonder about their drawing?", options: ["If it will be colorful", "If it will be as good as others", "If it will be big", "If it will be small"], answer: "If it will be as good as others" },
        { question: "Who does the child wonder if the teacher will look like?", options: ["Their brother", "Their Dad", "Their Mom or Grandmom", "Their friend"], answer: "Their Mom or Grandmom" },
        { question: "Which pet is mentioned in the poem?", options: ["Kitten", "Puppy", "Rabbit", "Parrot"], answer: "Puppy" },
        { question: "The word 'Wonder' means to ___.", options: ["Be sure", "Be curious or ask yourself", "Run fast", "Sleep"], answer: "Be curious or ask yourself" },
        { question: "Find a rhyming word for 'Stare'.", options: ["Star", "Bear", "Store", "Stair"], answer: "Bear" }
      ]
    },
    "Haldi’s Adventure": {
      content: `<h3><strong>Main focus: Surprise, adventure, and learning new things</strong></h3>
<p><strong>Chapter summary:</strong> Haldi meets a giraffe named Smiley on her way to school. Smiley wears glasses and carries a book! He tells Haldi about the wonderful things he sees. Haldi hops on his back and they "fly" to school. She learns that the world is full of surprises and that <strong>learning is an adventure</strong>. This story encourages children to be imaginative and observe the world around them.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Adventure, giraffe, glasses, surprised, wonderful</li>
<li>Describing characters: Smiley the Giraffe</li>
<li>Days of the week (mentioning going to school on Monday)</li>
<li>The idea that school can be fun and exciting</li>
</ul>`,
      quiz: [
        { question: "Who did Haldi meet on her way to school?", options: ["An elephant", "A giraffe", "A lion", "A rabbit"], answer: "A giraffe" },
        { question: "What was the giraffe's name?", options: ["Tallie", "Smiley", "Longy", "Happy"], answer: "Smiley" },
        { question: "What was the giraffe wearing?", options: ["A hat", "Glasses", "A scarf", "Shoes"], answer: "Glasses" },
        { question: "How did Haldi reach school in the end?", options: ["She ran", "She went by bus", "She rode on the giraffe's back", "She walked"], answer: "She rode on the giraffe's back" },
        { question: "What did the giraffe carry in his hand?", options: ["A bag", "A book", "A pencil", "A flower"], answer: "A book" }
      ]
    },
    "I Am Lucky": {
      content: `<h3><strong>Main focus: Self-acceptance and gratitude</strong></h3>
<p><strong>Chapter summary:</strong> If I were a butterfly, I'd be thankful for my wings. If I were a maina, I'd be thankful I could sing. If I were an elephant, I'd be thankful for my trunk. But I am just ME, and I am lucky to be me! This poem teaches children to <strong>value themselves</strong> and be happy with who they are, rather than wishing to be someone else.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Thankful, wings, trunk, lucky, giggle</li>
<li>Naming animals and their special features</li>
<li>Theme: Self-esteem and self-love</li>
<li>Using "If I were..." for imaginary situations</li>
</ul>`,
      quiz: [
        { question: "What is the butterfly thankful for?", options: ["Its song", "Its wings", "Its trunk", "Its legs"], answer: "Its wings" },
        { question: "Why is the elephant thankful?", options: ["Because it can fly", "Because it can raise its trunk", "Because it can sing", "Because it is small"], answer: "Because it can raise its trunk" },
        { question: "The main message of the poem is to be happy being ___.", options: ["A butterfly", "An elephant", "A fish", "YOURSELF"], answer: "YOURSELF" },
        { question: "A maina is thankful because it can ___.", options: ["Swim", "Hop", "Sing", "Run"], answer: "Sing" },
        { question: "Which animal is thankful for its tail?", options: ["Fish", "Kangaroo", "Monkey", "Cat"], answer: "Monkey" }
      ]
    },
    "I Want": {
      content: `<h3><strong>Main focus: Contentment and being happy with oneself</strong></h3>
<p><strong>Chapter summary:</strong> A little monkey wants to be big and strong. A wise woman gives him a magic wand. He gets a giraffe's neck, an elephant's trunk, and a zebra's stripes. But then he looks in the water and is scared of himself — he looks like a monster! He realizes he was <strong>happier as a monkey</strong>. He throws away the wand and never wants to be anyone else again.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Strong, magic wand, monster, stripes, stretch</li>
<li>Consequences of wishing to be something we are not</li>
<li>Animal features: Long neck (giraffe), trunk (elephant), stripes (zebra)</li>
<li>Value: Being happy with our own identity</li>
</ul>`,
      quiz: [
        { question: "What did the little monkey want to be?", options: ["Small", "Big and strong", "Funny", "Fast"], answer: "Big and strong" },
        { question: "Who gave the monkey a magic wand?", options: ["An elephant", "A wise woman", "A lion", "A bird"], answer: "A wise woman" },
        { question: "The monkey got stripes like a ___.", options: ["Tiger", "Zebra", "Cat", "Snake"], answer: "Zebra" },
        { question: "Why did the monkey cry 'Help!' when he saw himself in the river?", options: ["He saw a crocodile", "He thought he looked like a monster", "He fell in", "He was hungry"], answer: "He thought he looked like a monster" },
        { question: "In the end, what did the monkey do with the magic wand?", options: ["He kept it", "He gave it to a friend", "He threw it into the water", "He broke it"], answer: "He threw it into the water" }
      ]
    },
    "A Smile": {
      content: `<h3><strong>Main focus: Spreading happiness and the "contagious" nature of smiles</strong></h3>
<p><strong>Chapter summary:</strong> A smile is a very funny thing! It wrinkles up your face, and when it's gone, you can never find its secret hiding place. But the best thing is: if you smile at someone, they smile back, and then <strong>one smile makes two</strong>! This simple poem teaches children the power of kindness and how a small action can make someone else happy.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Wrinkles, secret, hiding place, funny</li>
<li>Rhyming words: Thing/Sing, Place/Face</li>
<li>Theme: Kindness and positivity</li>
<li>Metaphor: A smile as a "funny thing"</li>
</ul>`,
      quiz: [
        { question: "What does a smile do to your face?", options: ["Makes it dirty", "Wrinkles it up", "Makes it long", "Makes it red"], answer: "Wrinkles it up" },
        { question: "Where does a smile go when it's gone?", options: ["Under the bed", "To a secret hiding place", "To the market", "To school"], answer: "To a secret hiding place" },
        { question: "According to the poem, what happens when you smile at someone?", options: ["They run away", "They cry", "They smile back", "They get angry"], answer: "They smile back" },
        { question: "One smile can make ___.", options: ["Zero", "One", "Two", "Ten"], answer: "Two" },
        { question: "A smile is called a '___ thing'.", options: ["Sad", "Boring", "Funny", "Scary"], answer: "Funny" }
      ]
    },
    "The Wind and the Sun": {
      content: `<h3><strong>Main focus: Gentleness vs Force</strong></h3>
<p><strong>Chapter summary:</strong> The Wind and the Sun have a competition: who can make a man take off his coat? The Wind blows harder and harder, but the man just pulls his coat tighter. Then the Sun shines brightly. The man feels the warmth and takes off his coat. The Sun wins! This story teaches that <strong>gentleness and warmth are often more powerful than force and anger</strong>.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Competition, coat, puffing, shining, victory</li>
<li>Characters: The forceful Wind and the gentle Sun</li>
<li>Opposites: Cold/Hot, Hard/Soft</li>
<li>Moral: Kindness is more effective than strength</li>
</ul>`,
      quiz: [
        { question: "What was the competition between the Wind and the Sun?", options: ["Who can run faster", "Who can make a man take off his coat", "Who can make it rain", "Who is brighter"], answer: "Who can make a man take off his coat" },
        { question: "What did the man do when the Wind blew hard?", options: ["He took off his coat", "He ran away", "He pulled his coat tighter", "He started singing"], answer: "He pulled his coat tighter" },
        { question: "How did the Sun win?", options: ["By making it rain", "By shining brightly and making it hot", "By blowing hard", "By hiding"], answer: "By shining brightly and making it hot" },
        { question: "The Wind said, 'I can get his coat off ___ than you can.'", options: ["Slower", "More quickly", "Better", "Later"], answer: "More quickly" },
        { question: "In the end, who won?", options: ["The Wind", "The Man", "The Sun", "No one"], answer: "The Sun" }
      ]
    },
    "Rain": {
      content: `<h3><strong>Main focus: Observing nature during the rainy season</strong></h3>
<p><strong>Chapter summary:</strong> The rain is falling all around! It falls on the field and the tree, it rains on the umbrellas here, and on the ships at sea. This short, rhythmic poem helps children observe how rain covers the entire world, from land to sea. It encourages them to think about <strong>nature's patterns</strong> and how we protect ourselves (like with umbrellas).</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Field, umbrella, ship, sea, around</li>
<li>Rhyming words: Tree/Sea, Around/Ground</li>
<li>Theme: Universal nature of rain</li>
<li>Observation of surroundings during weather changes</li>
</ul>`,
      quiz: [
        { question: "Where does the rain fall?", options: ["Only in the garden", "All around", "Only on the roof", "Only in the park"], answer: "All around" },
        { question: "What does the rain fall on, besides the field?", options: ["The car", "The tree", "The house", "The dog"], answer: "The tree" },
        { question: "Where else is it raining, according to the poem?", options: ["On the mountains", "On the ships at sea", "On the moon", "On the birds"], answer: "On the ships at sea" },
        { question: "What do we use to stay dry in the rain?", options: ["A hat", "An umbrella", "A book", "A fan"], answer: "An umbrella" },
        { question: "Find a rhyming word for 'Sea'.", options: ["See", "Say", "Sun", "Sky"], answer: "See" }
      ]
    },
    "Storm in the Garden": {
      content: `<h3><strong>Main focus: Courage, small creatures, and nature's power</strong></h3>
<p><strong>Chapter summary:</strong> Sunu-sunu the snail is playing in the garden with his friends, the ants. Suddenly, a storm comes! There is lightning (Zich-zich!), thunder (Gadam-gudum!), and heavy rain. Sunu-sunu hides inside his shell. When it's over, he is safe and dry. This story introduces children to <strong>weather phenomena</strong> and shows how even small animals have ways to protect themselves.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Snail, storm, lightning, thunder, shell</li>
<li>Onomatopoeia: Words that sound like what they describe (Gadam-gudum, Shee-shee)</li>
<li>Animal features: Snail's shell as a house</li>
<li>Coping with fear during scary situations</li>
</ul>`,
      quiz: [
        { question: "Who was Sunu-sunu?", options: ["An ant", "A snail", "A bird", "A frog"], answer: "A snail" },
        { question: "Who were Sunu-sunu's friends?", options: ["Ants", "Bees", "Butterflies", "Snakes"], answer: "Ants" },
        { question: "Where did Sunu-sunu hide during the storm?", options: ["Under a leaf", "Inside his shell", "In a hole", "Under a stone"], answer: "Inside his shell" },
        { question: "What sound did the lightning make?", options: ["Gadam-gudum", "Zich-zich", "Shee-shee", "Phip-phip"], answer: "Zich-zich" },
        { question: "Did Sunu-sunu get wet in the storm?", options: ["Yes", "No"], answer: "No" }
      ]
    },
    "Zoo Manners": {
      content: `<h3><strong>Main focus: Respect for animals and proper behavior in public places</strong></h3>
<p><strong>Chapter summary:</strong> When you visit the Zoo, be careful what you say or do! Don't make fun of the Camel's hump or laugh too much at the Chimpanzee. Animals have feelings too. If you treat them with respect, you will always be <strong>welcome at the Zoo</strong>. This poem teaches <strong>empathy</strong> and manners when dealing with living creatures.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Manners, hump, chimpanzee, penguin, strutting</li>
<li>The idea that animals are "wise" and "noble"</li>
<li>Social skills: How to behave in a public place like a zoo</li>
<li>Comparing animal features to human traits (the Chimpanzee thinks he's wise)</li>
</ul>`,
      quiz: [
        { question: "What should we be careful about at the Zoo?", options: ["What we eat", "What we say or do", "Where we walk", "What we wear"], answer: "What we say or do" },
        { question: "Which animal has a 'proud' hump?", options: ["Lion", "Camel", "Elephant", "Tiger"], answer: "Camel" },
        { question: "Who thinks he is as wise as you or me?", options: ["The Penguin", "The Chimpanzee", "The Bear", "The Snake"], answer: "The Chimpanzee" },
        { question: "Which birds can understand what you say (according to the poem)?", options: ["Parrots", "Penguins", "Sparrows", "Ducks"], answer: "Penguins" },
        { question: "The word 'Strutting' means ___.", options: ["Running fast", "Walking with pride", "Sleeping", "Eating"], answer: "Walking with pride" }
      ]
    },
    "Funny Bunny": {
      content: `<h3><strong>Main focus: Thinking before following others and being cautious</strong></h3>
<p><strong>Chapter summary:</strong> One day, a nut falls on Funny Bunny's head. He thinks the sky is falling! He goes to tell the King. On the way, he meets many animals (Henny Penny, Cocky Locky, etc.) who all follow him. Finally, they meet Woxy Foxy, who leads them into his den and eats them up! This story is a warning to <strong>not believe everything blindly</strong> and to beware of strangers.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Falling, King, den, follow, together</li>
<li>Names with alliteration: Henny Penny, Ducky Lucky, Goosey Poosey</li>
<li>Theme: Foolishness and the danger of following the crowd</li>
<li>Logic: A falling nut is not the "sky falling"</li>
</ul>`,
      quiz: [
        { question: "What fell on Funny Bunny's head?", options: ["The sky", "A nut", "An apple", "A leaf"], answer: "A nut" },
        { question: "What did Funny Bunny think happened?", options: ["It was raining", "The sky was falling", "The King was calling", "He was hurt"], answer: "The sky was falling" },
        { question: "Who did Funny Bunny want to tell?", options: ["His Mom", "His friends", "The King", "The Doctor"], answer: "The King" },
        { question: "Who was the clever animal that ate everyone in the end?", options: ["Cocky Locky", "Woxy Foxy", "Ducky Lucky", "Lion"], answer: "Woxy Foxy" },
        { question: "Which animal did Funny Bunny meet FIRST?", options: ["Cocky Locky", "Henny Penny", "Lucky Ducky", "Foxy"], answer: "Henny Penny" }
      ]
    },
    "Mr Nobody": {
      content: `<h3><strong>Main focus: Responsibility and the habit of blaming others</strong></h3>
<p><strong>Chapter summary:</strong> Mr. Nobody is a quiet little man who does all the mischief in every house. He breaks plates, tears books, and leaves doors open. But no one ever sees his face! This poem is a humorous way to talk about <strong>taking responsibility</strong> for our mistakes instead of saying "I didn't do it" or blaming an invisible "Mr. Nobody."</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Mischief, quiet, cracked, mouse, agree</li>
<li>Rhyming words: Mouse/House, Face/Place</li>
<li>Theme: Honesty and accountability</li>
<li>The idea of a "funny" invisible character who does wrong</li>
</ul>`,
      quiz: [
        { question: "How is Mr. Nobody described?", options: ["Loud and big", "Quiet and little", "Strong and fast", "Scary"], answer: "Quiet and little" },
        { question: "Mr. Nobody is as quiet as a ___.", options: ["Cat", "Dog", "Mouse", "Rabbit"], answer: "Mouse" },
        { question: "Who does the mischief in every house?", options: ["The children", "The parents", "Mr. Nobody", "The pet"], answer: "Mr. Nobody" },
        { question: "Has anyone ever seen Mr. Nobody's face?", options: ["Yes", "No", "Only the kids", "Only the cat"], answer: "No" },
        { question: "When a plate is cracked, who is blamed?", options: ["The cook", "The child", "Mr. Nobody", "The wind"], answer: "Mr. Nobody" }
      ]
    },
    "Curlylocks and the Three Bears": {
      content: `<h3><strong>Main focus: Curisosity, boundaries, and consequences</strong></h3>
<p><strong>Chapter summary:</strong> Curlylocks enters a house in the forest while the Bear family is out. She eats their porridge (too hot, too cold, then just right), sits on their chairs (too big, too high, then breaks the small one), and sleeps in their beds. When the Bears return, they are surprised! Curlylocks wakes up, see them, and runs away. This classic story teaches about <strong>respecting other people's property</strong>.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Vocabulary: Porridge, forest, cottage, middle-size, tiny</li>
<li>Comparison: Hot/Cold, Big/Small, Hard/Soft</li>
<li>Sequencing: First, then, finally</li>
<li>Theme: Respecting privacy and property</li>
</ul>`,
      quiz: [
        { question: "Where was the house that Curlylocks went into?", options: ["In the city", "In the forest", "Near the beach", "On a hill"], answer: "In the forest" },
        { question: "Who lived in the cottage?", options: ["A family of rabbits", "A family of bears", "A giant", "A grandmother"], answer: "A family of bears" },
        { question: "Whose porridge did Curlylocks finish?", options: ["Papa Bear's", "Mama Bear's", "Baby Bear's", "She didn't eat any"], answer: "Baby Bear's" },
        { question: "What happened to the tiny chair when Curlylocks sat on it?", options: ["It was too high", "It was too hard", "It broke", "It was just right"], answer: "It broke" },
        { question: "Where did the Bears find Curlylocks sleeping?", options: ["In the kitchen", "In Papa Bear's bed", "In Mama Bear's bed", "In Baby Bear's bed"], answer: "In Baby Bear's bed" }
      ]
    },
    "Oont Chala": {
      content: "Welcome to the lesson on Oont Chala! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Oont Chala?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Oont Chala?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Bhalu Ne Kheli Football": {
      content: "Welcome to the lesson on Bhalu Ne Kheli Football! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bhalu Ne Kheli Football?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bhalu Ne Kheli Football?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Mera Parivar": {
      content: "Welcome to the lesson on Mera Parivar! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Mera Parivar?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Mera Parivar?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Adhyapak Ji": {
      content: "Welcome to the lesson on Adhyapak Ji! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Adhyapak Ji?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Adhyapak Ji?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Andher Nagari": {
      content: "Welcome to the lesson on Andher Nagari! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Andher Nagari?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Andher Nagari?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Budhiya Ki Topi": {
      content: "Welcome to the lesson on Budhiya Ki Topi! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Budhiya Ki Topi?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Budhiya Ki Topi?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Meethe Bol": {
      content: "Welcome to the lesson on Meethe Bol! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Meethe Bol?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Meethe Bol?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Titli Aur Kali": {
      content: "Welcome to the lesson on Titli Aur Kali! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Titli Aur Kali?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Titli Aur Kali?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Bulbul": {
      content: "Welcome to the lesson on Bulbul! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bulbul?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bulbul?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Mera Khilauna": {
      content: "Welcome to the lesson on Mera Khilauna! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Mera Khilauna?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Mera Khilauna?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "What is Long, What is Round?": {
      content: `<h3><strong>Main focus: Shapes — Roll vs Slide</strong></h3>
<p><strong>Chapter summary:</strong> Everything has a shape, and shapes move in special ways. <strong>Round things</strong> (ball, orange, marble) have no corners and like to <strong>Roll</strong>. <strong>Long things</strong> (pencil, scale, book) have flat sides and like to <strong>Slide</strong>. Some things like a coin can do both! A square box cannot roll because it has corners and flat sides.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Round things → <strong>Roll</strong> (ball, orange, ladoo)</li>
<li>Long / flat things → <strong>Slide</strong> (pencil, scale, matchbox)</li>
<li>Coin → can <strong>both slide AND roll</strong> depending on position</li>
<li>A square box cannot be used as a football because it has corners</li>
</ul>`,
      quiz: [
        { question: "Which of these will ROLL on the floor?", options: ["A pencil lying flat", "A matchbox", "An orange", "A ruler"], answer: "An orange" },
        { question: "If you push a matchbox on the floor, will it roll or slide?", options: ["Roll", "Slide", "Both", "Neither"], answer: "Slide" },
        { question: "A ladoo (round sweet) is which type of shape?", options: ["Long", "Flat", "Round", "Square"], answer: "Round" },
        { question: "Why can't we play football with a square box?", options: ["It is too small", "It has corners, so it does not roll properly", "It is too heavy", "It has no colour"], answer: "It has corners, so it does not roll properly" },
        { question: "A banana is best described as ___.", options: ["Round", "Long", "Flat", "Square"], answer: "Long" }
      ]
    },
    "Counting in Groups": {
      content: `<h3><strong>Main focus: Skip Counting — the secret of multiplication!</strong></h3>
<p><strong>Chapter summary:</strong> Instead of counting by ones, we count in <strong>Groups</strong>. If you have 3 groups of 2 cherries, count them as 2, 4, 6 — that is skip counting by 2s! If one bicycle has 2 wheels, then 3 bicycles have 6 wheels. It is like a frog jumping over numbers!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Count by <strong>2s</strong>: 2, 4, 6, 8, 10…</li>
<li>Count by <strong>5s</strong>: 5, 10, 15, 20, 25…</li>
<li>Count by <strong>10s</strong>: 10, 20, 30, 40…</li>
<li>4 hands × 5 fingers = 20 fingers total</li>
</ul>`,
      quiz: [
        { question: "Count by 2s: 2, 4, 6, ___, ___", options: ["7, 8", "8, 10", "8, 9", "9, 11"], answer: "8, 10" },
        { question: "One bicycle has 2 wheels. How many wheels do 3 bicycles have?", options: ["3", "5", "6", "4"], answer: "6" },
        { question: "Count by 5s: 5, 10, 15, ___, ___", options: ["16, 17", "20, 25", "18, 20", "19, 24"], answer: "20, 25" },
        { question: "There are 4 hands. Each hand has 5 fingers. How many fingers in total?", options: ["15", "9", "25", "20"], answer: "20" },
        { question: "Skip counting by 2s is like a ___.", options: ["Turtle walking slowly", "Frog jumping over numbers", "Fish swimming backwards", "Snail moving one step"], answer: "Frog jumping over numbers" }
      ]
    },
    "How Much Can You Carry?": {
      content: `<h3><strong>Main focus: Weight — Heavier and Lighter</strong></h3>
<p><strong>Chapter summary:</strong> We compare weights using a <strong>balance (weighing scale)</strong>. The heavier side goes down and the lighter side goes up. We can also use nonstandard units like small stones or blocks to measure weight. This chapter introduces us to comparing and estimating weight.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Heavier object makes the balance go <strong>down</strong></li>
<li>Lighter object goes <strong>up</strong> on the balance</li>
<li>We can use stones, blocks, or any equal objects to measure weight</li>
<li>Compare: a book vs a pencil → the book is heavier</li>
</ul>`,
      quiz: [
        { question: "On a balance, the heavier object will go ___.", options: ["Up", "Down", "Sideways", "Stay in the middle"], answer: "Down" },
        { question: "Which is heavier: a feather or a stone?", options: ["Feather", "Stone", "Both are equal", "Cannot say"], answer: "Stone" },
        { question: "We use a balance to compare ___.", options: ["Height", "Length", "Weight", "Colour"], answer: "Weight" },
        { question: "If a book weighs 5 blocks and a pencil weighs 1 block, which is heavier?", options: ["Pencil", "Both equal", "Book", "Block"], answer: "Book" },
        { question: "The lighter object on a balance goes ___.", options: ["Down", "Up", "Left", "Right"], answer: "Up" }
      ]
    },
    "Counting in Tens": {
      content: `<h3><strong>Main focus: Grouping into tens for fast counting</strong></h3>
<p><strong>Chapter summary:</strong> When we have many objects, we group them into <strong>bundles of 10</strong> to count faster. 20 = 2 bundles of 10. 50 = 5 bundles of 10. We count by tens: 10, 20, 30, 40, 50… This is the foundation of our whole number system!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>10 objects = 1 bundle / 1 Ten</li>
<li>20 = 2 Tens, 50 = 5 Tens, 100 = 10 Tens</li>
<li>Counting by 10s: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100</li>
<li>The Tens digit tells us how many bundles there are</li>
</ul>`,
      quiz: [
        { question: "How many tens are in 40?", options: ["2", "4", "40", "1"], answer: "4" },
        { question: "Count by tens: 30, 40, 50, ___", options: ["55", "51", "60", "45"], answer: "60" },
        { question: "30 objects = ___ bundles of ten", options: ["10", "1", "30", "3"], answer: "3" },
        { question: "What comes after 90 when counting by tens?", options: ["91", "95", "100", "99"], answer: "100" },
        { question: "Which number has 7 Tens?", options: ["17", "7", "70", "77"], answer: "70" }
      ]
    },
    "Footprints": {
      content: `<h3><strong>Main focus: Measuring length using footsteps and body parts</strong></h3>
<p><strong>Chapter summary:</strong> Before we use a ruler, we can measure length using <strong>footsteps</strong>, our <strong>handspan</strong>, or a <strong>string</strong>. Different people get different measurements for the same object because body sizes differ. This shows why we eventually need a standard unit. We compare lengths using words: <strong>Longer / Shorter / Taller</strong>.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Measuring with <strong>footsteps</strong>: count steps to find length</li>
<li>Measuring with <strong>handspan</strong>: thumb to little finger</li>
<li>Different people get different counts for the same length</li>
<li>Compare: <strong>Longer, Shorter, Taller, Same length</strong></li>
</ul>`,
      quiz: [
        { question: "We measure length using footsteps by ___.", options: ["Drawing footprints", "Counting how many steps fit the length", "Weighing our feet", "Comparing colours"], answer: "Counting how many steps fit the length" },
        { question: "Why might two children get different footstep counts for the same table?", options: ["They counted wrong", "Their feet are different sizes", "The table moved", "They used different numbers"], answer: "Their feet are different sizes" },
        { question: "A pencil is 3 handspans long. A book is 5 handspans long. Which is longer?", options: ["Pencil", "Book", "Both are same", "Cannot say"], answer: "Book" },
        { question: "Which word compares two lengths?", options: ["Heavier", "Taller", "Hotter", "Louder"], answer: "Taller" },
        { question: "We measure length without a ruler using ___.", options: ["A clock", "A balance", "A handspan or footstep", "A coin"], answer: "A handspan or footstep" }
      ]
    },
    "Jugs and Mugs": {
      content: `<h3><strong>Main focus: Capacity — how much a container holds</strong></h3>
<p><strong>Chapter summary:</strong> Capacity is <strong>how much liquid a container can hold</strong>. A jug holds more water than a mug. We compare capacity using: <strong>More / Less / Same</strong>. We can also measure capacity by counting how many small cups fill a big jug. This is our first step toward understanding litres!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Capacity</strong> = how much a container holds</li>
<li>A <strong>jug</strong> holds more than a <strong>mug</strong></li>
<li>Compare capacity: <strong>More, Less, Same</strong></li>
<li>Count how many small cups fill a big container</li>
</ul>`,
      quiz: [
        { question: "Capacity means ___.", options: ["The weight of a container", "How much a container can hold", "The height of a container", "The colour of a container"], answer: "How much a container can hold" },
        { question: "A jug holds 6 cups of water. A bottle holds 4 cups. Which holds more?", options: ["Bottle", "Cup", "Jug", "Both same"], answer: "Jug" },
        { question: "Which container holds LESS water?", options: ["A bucket", "A swimming pool", "A teaspoon", "A drum"], answer: "A teaspoon" },
        { question: "We compare capacity using the words ___.", options: ["Taller / Shorter", "Heavier / Lighter", "More / Less / Same", "Near / Far"], answer: "More / Less / Same" },
        { question: "How many glasses of water does it take to fill a bottle? This question is about ___.", options: ["Weight", "Length", "Capacity", "Time"], answer: "Capacity" }
      ]
    },
    "Tens and Ones": {
      content: `<h3><strong>Main focus: Place value — Tens digit and Ones digit</strong></h3>
<p><strong>Chapter summary:</strong> Every 2-digit number has a <strong>Tens place</strong> and a <strong>Ones place</strong>. In 34, the 3 is in the Tens place (= 30) and the 4 is in the Ones place (= 4). So 34 = 3 Tens + 4 Ones. This is called <strong>place value</strong> and is the most important idea in our number system!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>In any 2-digit number: <strong>left digit = Tens, right digit = Ones</strong></li>
<li>34 = 3 Tens + 4 Ones = 30 + 4</li>
<li>57 = 5 Tens + 7 Ones = 50 + 7</li>
<li>The Tens digit is always worth 10 times more than its face value</li>
</ul>`,
      quiz: [
        { question: "In the number 47, the digit 4 is in the ___ place.", options: ["Ones", "Hundreds", "Tens", "Units"], answer: "Tens" },
        { question: "What is the value of the digit 6 in the number 68?", options: ["6", "8", "60", "68"], answer: "60" },
        { question: "35 = 3 Tens + ___ Ones", options: ["3", "35", "5", "30"], answer: "5" },
        { question: "Which number has 5 in the Tens place?", options: ["25", "52", "15", "55"], answer: "52" },
        { question: "In 2-digit numbers, which digit do we look at FIRST to compare?", options: ["The Ones digit", "Both digits", "The Tens digit", "The last digit"], answer: "The Tens digit" }
      ]
    },
    "My Funday": {
      content: `<h3><strong>Main focus: Money — Indian coins and notes</strong></h3>
<p><strong>Chapter summary:</strong> In India we use <strong>Rupees (₹)</strong>. We have coins: ₹1, ₹2, ₹5, ₹10, and notes: ₹10, ₹20, ₹50. To buy something, we count our money and check if we have enough. If a chocolate costs ₹10, we can give one ₹10 note OR five ₹2 coins — both are equal!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Indian currency: coins (₹1, ₹2, ₹5, ₹10) and notes (₹10, ₹20, ₹50)</li>
<li>Count money to find the total amount</li>
<li>Compare prices: ₹50 is more than ₹20</li>
<li>Change = Amount given − Price paid</li>
</ul>`,
      quiz: [
        { question: "How many ₹1 coins make ₹5?", options: ["1", "10", "3", "5"], answer: "5" },
        { question: "An eraser costs ₹3 and a pencil costs ₹5. How much money do you need in total?", options: ["₹2", "₹15", "₹8", "₹9"], answer: "₹8" },
        { question: "Which is more: ₹20 or ₹50?", options: ["₹20", "₹50", "Both are equal", "Cannot say"], answer: "₹50" },
        { question: "You have ₹10. You buy a candy for ₹7. How much change do you get?", options: ["₹17", "₹3", "₹4", "₹7"], answer: "₹3" },
        { question: "Indian money is measured in ___.", options: ["Dollars", "Pounds", "Rupees", "Euros"], answer: "Rupees" }
      ]
    },
    "Add Our Points": {
      content: `<h3><strong>Main focus: Addition up to 20 using counting on</strong></h3>
<p><strong>Chapter summary:</strong> To add bigger numbers, use the <strong>Counting On</strong> trick. To add 12 + 3, start at 12 and count 3 steps forward: "13, 14, 15!" There are 12 carrots and 7 radishes in a garden — how many vegetables in total? 12 + 7 = 19.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Counting On:</strong> Start at the bigger number, count forward</li>
<li>11 + 5 = 16 (start at 11, count 5 steps: 12, 13, 14, 15, 16)</li>
<li>10 + 10 = 20</li>
<li>Adding numbers in a story problem step by step</li>
</ul>`,
      quiz: [
        { question: "11 + 5 = ___ (Count on from 11)", options: ["15", "16", "17", "14"], answer: "16" },
        { question: "10 + 10 = ___", options: ["100", "11", "20", "10"], answer: "20" },
        { question: "There are 12 carrots and 7 radishes. How many vegetables in total?", options: ["5", "20", "18", "19"], answer: "19" },
        { question: "To use the 'Counting On' trick for 13 + 4, you start at ___.", options: ["4", "1", "13", "17"], answer: "13" },
        { question: "What is 8 + 6?", options: ["12", "13", "15", "14"], answer: "14" }
      ]
    },
    "Lines and Lines": {
      content: `<h3><strong>Main focus: Types of lines and basic geometry</strong></h3>
<p><strong>Chapter summary:</strong> Lines are everywhere! A <strong>straight line</strong> goes from one point to another without bending. A <strong>curved line</strong> bends. Lines can be <strong>horizontal</strong> (sleeping flat), <strong>vertical</strong> (standing up), or <strong>slanting</strong> (tilted). Shapes are made of lines — a triangle has 3 straight lines, a circle has one curved line.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Straight line</strong>: goes directly, no bending</li>
<li><strong>Curved line</strong>: bends or curves</li>
<li><strong>Horizontal</strong>: lying flat (like the horizon)</li>
<li><strong>Vertical</strong>: standing straight up</li>
<li><strong>Slanting</strong>: tilted at an angle</li>
</ul>`,
      quiz: [
        { question: "A line that bends is called a ___ line.", options: ["Straight", "Vertical", "Curved", "Horizontal"], answer: "Curved" },
        { question: "The horizon where the sky meets the ground is an example of a ___ line.", options: ["Vertical", "Curved", "Slanting", "Horizontal"], answer: "Horizontal" },
        { question: "A triangle is made of ___ straight lines.", options: ["2", "4", "3", "5"], answer: "3" },
        { question: "A flagpole standing upright is an example of a ___ line.", options: ["Horizontal", "Curved", "Vertical", "Slanting"], answer: "Vertical" },
        { question: "A circle is made of ___.", options: ["4 straight lines", "3 straight lines", "1 curved line", "2 curved lines"], answer: "1 curved line" }
      ]
    },
    "Give and Take": {
      content: `<h3><strong>Main focus: Subtraction up to 20 using counting back</strong></h3>
<p><strong>Chapter summary:</strong> To subtract bigger numbers, use the <strong>Counting Back</strong> trick. To find 15 − 4, start at 15 and count back 4 steps: "14, 13, 12, 11!" A farmer had 18 eggs and 5 broke: 18 − 5 = 13. Money problems also use subtraction: you have ₹10, buy a candy for ₹7, change = ₹3.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Counting Back:</strong> Start at the big number, count backward</li>
<li>15 − 4 = 11 (count back: 14, 13, 12, 11)</li>
<li>Subtraction in shopping: change = amount given − price</li>
<li>Subtracting 0 gives the same number</li>
</ul>`,
      quiz: [
        { question: "15 − 4 = ___ (Count back from 15)", options: ["10", "9", "12", "11"], answer: "11" },
        { question: "A farmer had 18 eggs. 5 broke. How many are left?", options: ["23", "12", "13", "14"], answer: "13" },
        { question: "You have ₹10. You buy a candy for ₹7. How much change do you get?", options: ["₹17", "₹2", "₹4", "₹3"], answer: "₹3" },
        { question: "20 − 0 = ___", options: ["0", "10", "20", "1"], answer: "20" },
        { question: "To use Counting Back for 17 − 3, you start at ___.", options: ["3", "14", "17", "0"], answer: "17" }
      ]
    },
    "The Longest Step": {
      content: `<h3><strong>Main focus: Comparing and ordering lengths</strong></h3>
<p><strong>Chapter summary:</strong> We measure the length of a step using a string or chalk mark. Then we compare steps: whose step is the <strong>longest</strong>? Whose is the <strong>shortest</strong>? We can also order objects from shortest to longest. This chapter builds the skill of comparing and ordering measurements.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Measure a step by marking its start and end</li>
<li>Order steps: <strong>Shortest → Longest</strong></li>
<li>Use strings to compare curved or irregular lengths</li>
<li>The <strong>longest</strong> step covers the most distance</li>
</ul>`,
      quiz: [
        { question: "To find the longest step, you need to ___.", options: ["Count the number of toes", "Compare the length of each step", "Weigh each person", "Measure height"], answer: "Compare the length of each step" },
        { question: "Rohan's step is 50 cm. Priya's step is 40 cm. Whose step is longer?", options: ["Priya's", "Both are same", "Rohan's", "Cannot say"], answer: "Rohan's" },
        { question: "To compare a curved path and a straight path, we can use a ___.", options: ["Ruler", "Clock", "String", "Balance"], answer: "String" },
        { question: "Arranging objects from shortest to longest means ordering by ___.", options: ["Colour", "Weight", "Length", "Time"], answer: "Length" },
        { question: "Which unit do we use for big lengths like a road?", options: ["Grams", "Litres", "Kilometres", "Seconds"], answer: "Kilometres" }
      ]
    },
    "Birds Come, Birds Go": {
      content: `<h3><strong>Main focus: Subtraction as difference and data from a table</strong></h3>
<p><strong>Chapter summary:</strong> Birds arrive and birds fly away — we use subtraction to find how many are left! We also look at simple tables of data: if 15 birds came and 6 flew away, 15 − 6 = 9 are left. We learn to read information from a picture or table and answer questions using addition and subtraction.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Subtraction finds <strong>how many are left</strong> after some go away</li>
<li>Read data from a <strong>table or picture</strong></li>
<li>15 birds − 6 that flew away = 9 remaining</li>
<li>Addition to find total; subtraction to find difference</li>
</ul>`,
      quiz: [
        { question: "15 birds sat on a tree. 6 flew away. How many are left?", options: ["21", "10", "9", "8"], answer: "9" },
        { question: "Birds Come, Birds Go teaches us to use ___ to find how many remain.", options: ["Addition", "Subtraction", "Multiplication", "Patterns"], answer: "Subtraction" },
        { question: "A table shows 8 sparrows and 5 pigeons. How many birds in total?", options: ["3", "13", "40", "85"], answer: "13" },
        { question: "Reading information from a picture or chart to answer questions is called ___.", options: ["Data reading", "Measurement", "Pattern making", "Skip counting"], answer: "Data reading" },
        { question: "20 birds were on a wire. 11 flew off. How many are still on the wire?", options: ["31", "9", "10", "11"], answer: "9" }
      ]
    },
    "Family": {
      content: `<h3><strong>Main focus: Living together and caring for each other</strong></h3>
<p><strong>Chapter summary:</strong> A family is a group of people who live together and love each other. We learn that every family is special. Some are big (joint family) and some are small (nuclear family). Families celebrate festivals, share meals, and help each other during difficult times. This chapter teaches the importance of <strong>cooperation</strong> and <strong>respect</strong> within the home.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Types of families: Nuclear, Joint, Single-parent</li>
<li>Relationships: Grandparents, parents, siblings, cousins</li>
<li>Roles and responsibilities of family members</li>
<li>Celebrating special occasions together</li>
</ul>`,
      quiz: [
        { question: "A family with parents and one or two children is a ___ family.", options: ["Big", "Nuclear", "Joint", "Neighbourhood"], answer: "Nuclear" },
        { question: "Your father's brother is your ___.", options: ["Grandfather", "Cousin", "Uncle", "Nephew"], answer: "Uncle" },
        { question: "What is the most important thing in a family?", options: ["Fighting", "Ignoring each other", "Love and care", "Watching TV"], answer: "Love and care" },
        { question: "In a joint family, who usually lives together?", options: ["Only parents and children", "Only grandparents", "Many relatives like grandparents, uncles, and cousins", "Only friends"], answer: "Many relatives like grandparents, uncles, and cousins" },
        { question: "We should ___ our elders in the family.", options: ["Ignore", "Shout at", "Respect", "Tease"], answer: "Respect" }
      ]
    },
    "Food for Us": {
      content: `<h3><strong>Main focus: Why we need food and different types of food</strong></h3>
<p><strong>Chapter summary:</strong> Food is essential for life. It gives us energy to work and play, helps us grow, and protects us from diseases. We get food from both <strong>plants</strong> (fruits, vegetables, grains) and <strong>animals</strong> (milk, eggs, meat). A balanced diet with clean water and healthy habits like washing hands is the secret to a strong body.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Energy-giving food: Rice, potato, sugar</li>
<li>Body-building food: Pulses, milk, eggs</li>
<li>Protective food: Fruits and vegetables</li>
<li>Good eating habits and hygiene</li>
</ul>`,
      quiz: [
        { question: "Which of these gives us energy?", options: ["Water", "Rice and sugar", "Salt", "Nothing"], answer: "Rice and sugar" },
        { question: "Milk and pulses help our body to ___.", options: ["Sleep", "Grow", "Get tired", "Fly"], answer: "Grow" },
        { question: "Fruits and vegetables are called ___ food.", options: ["Bad", "Energy", "Protective", "Junk"], answer: "Protective" },
        { question: "We should eat ___ food to stay healthy.", options: ["Uncovered", "Stale", "Fresh and clean", "Junk"], answer: "Fresh and clean" },
        { question: "Which food do we get from animals?", options: ["Apple", "Rice", "Eggs", "Carrot"], answer: "Eggs" }
      ]
    },
    "Shelter": {
      content: `<h3><strong>Main focus: Different types of houses and their importance</strong></h3>
<p><strong>Chapter summary:</strong> A house protects us from heat, cold, rain, and wild animals. It is our <strong>shelter</strong>. Different places have different types of houses: <strong>Kucha houses</strong> (made of mud/straw) are common in villages, while <strong>Pucca houses</strong> (made of bricks/cement) are found in towns. We also learn about special houses like igloos, houseboats, and tents.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Need for a house: Safety and comfort</li>
<li>Types of houses: Kucha and Pucca</li>
<li>Rooms in a house and their uses</li>
<li>A clean house is a healthy house</li>
</ul>`,
      quiz: [
        { question: "A house made of mud and straw is a ___ house.", options: ["Pucca", "Strong", "Kucha", "Big"], answer: "Kucha" },
        { question: "Which of these is used to build a Pucca house?", options: ["Mud", "Straw", "Bricks and cement", "Dry leaves"], answer: "Bricks and cement" },
        { question: "An igloo is a house made of ___.", options: ["Bricks", "Snow/Ice", "Wood", "Cloth"], answer: "Snow/Ice" },
        { question: "A house that can move from place to place is a ___.", options: ["Bungalow", "Flat", "Tent", "Hut"], answer: "Tent" },
        { question: "We should keep our house ___.", options: ["Dirty", "Dusty", "Clean and tidy", "Messy"], answer: "Clean and tidy" }
      ]
    },
    "Travel": {
      content: `<h3><strong>Main focus: Means of transport and safety rules</strong></h3>
<p><strong>Chapter summary:</strong> We use different <strong>means of transport</strong> to travel from one place to another. <strong>Land transport</strong> includes cars, buses, and trains. <strong>Water transport</strong> includes ships and boats. <strong>Air transport</strong> is the fastest way to travel. We must always follow safety rules on the road, like wearing a helmet or crossing at the zebra crossing.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Land, Water, and Air transport</li>
<li>Fastest and slowest means of transport</li>
<li>Road safety signs and rules</li>
<li>Need for transport in daily life</li>
</ul>`,
      quiz: [
        { question: "Which is the fastest means of transport?", options: ["Bus", "Train", "Aeroplane", "Bicycle"], answer: "Aeroplane" },
        { question: "A ship is a means of ___ transport.", options: ["Land", "Water", "Air", "Space"], answer: "Water" },
        { question: "Where should we cross the road?", options: ["Anywhere", "At the Zebra crossing", "Running fast", "Between cars"], answer: "At the Zebra crossing" },
        { question: "Which of these has two wheels?", options: ["Car", "Bus", "Bicycle", "Auto-rickshaw"], answer: "Bicycle" },
        { question: "Traffic light: Green means ___.", options: ["Stop", "Wait", "Go", "Look"], answer: "Go" }
      ]
    },
    "Plants and Animals": {
      content: `<h3><strong>Main focus: Living things in nature</strong></h3>
<p><strong>Chapter summary:</strong> Plants and animals are living things that share our world. Plants give us oxygen, food, and shade. Animals provide us with milk, eggs, and wool, or help us carry loads. We learn that we must be <strong>kind to animals</strong> and <strong>take care of plants</strong> because our life depends on them.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Uses of plants: Oxygen, food, wood</li>
<li>Uses of animals: Food, transport, wool</li>
<li>Different parts of plants</li>
<li>Domestic vs Wild animals</li>
</ul>`,
      quiz: [
        { question: "What do plants give us that helps us breathe?", options: ["Water", "Oxygen", "Food", "Soil"], answer: "Oxygen" },
        { question: "Which animal gives us wool?", options: ["Cow", "Hen", "Sheep", "Dog"], answer: "Sheep" },
        { question: "The part of the plant that grows under the soil is the ___.", options: ["Leaf", "Stem", "Flower", "Root"], answer: "Root" },
        { question: "A lion is a ___ animal.", options: ["Pet", "Wild", "Domestic", "Friendly"], answer: "Wild" },
        { question: "Which of these do we get from plants?", options: ["Eggs", "Milk", "Fruits", "Meat"], answer: "Fruits" }
      ]
    },
    "Neighbourhood": {
      content: `<h3><strong>Main focus: Places and people around us</strong></h3>
<p><strong>Chapter summary:</strong> The area around our house is our <strong>neighbourhood</strong>. We find many useful places there: the <strong>Market</strong> for shopping, the <strong>Hospital</strong> for treatment, the <strong>Police Station</strong> for safety, and the <strong>Post Office</strong> for sending letters. Good neighbours help each other and keep the neighbourhood clean.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Important places in the neighbourhood</li>
<li>Roles of community helpers</li>
<li>Being a good neighbour</li>
<li>Keeping our surroundings clean</li>
</ul>`,
      quiz: [
        { question: "Where do we go when we are sick?", options: ["School", "Market", "Hospital", "Park"], answer: "Hospital" },
        { question: "The place where we go to buy things is the ___.", options: ["Post Office", "Market", "Police Station", "Bank"], answer: "Market" },
        { question: "Who keeps our neighbourhood safe?", options: ["Postman", "Police Officer", "Doctor", "Tailor"], answer: "Police Officer" },
        { question: "A person living near our house is our ___.", options: ["Relative", "Teacher", "Neighbour", "Guest"], answer: "Neighbour" },
        { question: "Where do we go to post a letter?", options: ["Bank", "Post Office", "Hospital", "Library"], answer: "Post Office" }
      ]
    },
    "My School": {
      content: `<h3><strong>Main focus: Learning and growing at school</strong></h3>
<p><strong>Chapter summary:</strong> School is a temple of learning. We learn to read, write, draw, and play games there. We also learn <strong>good manners</strong> and values. Our teachers guide us to become good citizens. We should respect our teachers, make friends, and keep our school clean.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Places in school: Classroom, Library, Playground</li>
<li>People in school: Principal, Teachers, Friends</li>
<li>Learning subjects and activities</li>
<li>School rules and discipline</li>
</ul>`,
      quiz: [
        { question: "We go to school to ___.", options: ["Sleep", "Learn and study", "Fight", "Watch TV"], answer: "Learn and study" },
        { question: "The head of the school is the ___.", options: ["Peon", "Teacher", "Principal", "Student"], answer: "Principal" },
        { question: "Where do we play games in school?", options: ["Classroom", "Library", "Playground", "Office"], answer: "Playground" },
        { question: "Who teaches us in the classroom?", options: ["Doctor", "Postman", "Teacher", "Policeman"], answer: "Teacher" },
        { question: "We find many books to read in the school ___.", options: ["Canteen", "Library", "Garden", "Bus"], answer: "Library" }
      ]
    },
    "Festivals": {
      content: `<h3><strong>Main focus: Celebrating together with joy</strong></h3>
<p><strong>Chapter summary:</strong> India is a land of festivals! We celebrate <strong>National Festivals</strong> like Independence Day and <strong>Religious Festivals</strong> like Diwali, Eid, and Christmas. Festivals bring people together. We wear new clothes, eat special food, and share happiness with everyone.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>National Festivals: Independence Day, Republic Day, Gandhi Jayanti</li>
<li>Religious Festivals: Diwali, Holi, Eid, Christmas, Gurpurab</li>
<li>How we celebrate: Decorations, sweets, prayers</li>
<li>Values: Unity and sharing</li>
</ul>`,
      quiz: [
        { question: "When do we celebrate Independence Day?", options: ["26th January", "15th August", "2nd October", "25th December"], answer: "15th August" },
        { question: "Diwali is also called the Festival of ___.", options: ["Colours", "Lights", "Flowers", "Rain"], answer: "Lights" },
        { question: "On which festival do we play with colours?", options: ["Eid", "Christmas", "Holi", "Diwali"], answer: "Holi" },
        { question: "Whose birthday is celebrated on 2nd October?", options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Subhas Chandra Bose", "Bhagat Singh"], answer: "Mahatma Gandhi" },
        { question: "Special sweet dish 'Sewaiyan' is prepared on ___.", options: ["Diwali", "Eid", "Christmas", "Holi"], answer: "Eid" }
      ]
    },
    "Air and Water": {
      content: `<h3><strong>Main focus: Essential elements for life</strong></h3>
<p><strong>Chapter summary:</strong> All living things need air and water to survive. <strong>Air</strong> is everywhere; we can feel it but not see it. Clean air is important for breathing. <strong>Water</strong> is used for drinking, bathing, and cleaning. We must not waste water or pollute the air and water around us.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Moving air is called wind</li>
<li>Uses of water: Drinking, cooking, washing, farming</li>
<li>Sources of water: Rain, rivers, wells</li>
<li>Saving water and preventing pollution</li>
</ul>`,
      quiz: [
        { question: "Moving air is called ___.", options: ["Cloud", "Rain", "Wind", "Storm"], answer: "Wind" },
        { question: "We need water for ___.", options: ["Breathing", "Drinking", "Flying", "Thinking"], answer: "Drinking" },
        { question: "The main source of water on earth is ___.", options: ["Taps", "Bottles", "Rain", "Pipes"], answer: "Rain" },
        { question: "We should ___ the tap while brushing our teeth.", options: ["Keep open", "Close", "Break", "Forget"], answer: "Close" },
        { question: "Dirty air can make us ___.", options: ["Strong", "Happy", "Sick", "Rich"], answer: "Sick" }
      ]
    },
    "Weather and Seasons": {
      content: `<h3><strong>Main focus: Changes in the environment</strong></h3>
<p><strong>Chapter summary:</strong> The weather changes every day. Sometimes it is sunny, sometimes rainy, and sometimes windy. When the same weather continues for a long time, it is called a <strong>Season</strong>. In India, we have five main seasons: Summer, Winter, Monsoon, Spring, and Autumn.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Seasons: Summer (hot), Winter (cold), Monsoon (rainy)</li>
<li>Spring and Autumn: Transition seasons</li>
<li>Clothes and food according to seasons</li>
<li>How seasons affect our lives</li>
</ul>`,
      quiz: [
        { question: "In which season do we wear woollen clothes?", options: ["Summer", "Monsoon", "Winter", "Spring"], answer: "Winter" },
        { question: "We use an umbrella during the ___ season.", options: ["Autumn", "Winter", "Monsoon", "Summer"], answer: "Monsoon" },
        { question: "The season when it is very hot is ___.", options: ["Winter", "Summer", "Spring", "Autumn"], answer: "Summer" },
        { question: "In which season do flowers bloom everywhere?", options: ["Winter", "Summer", "Spring", "Monsoon"], answer: "Spring" },
        { question: "Cotton clothes keep us ___.", options: ["Warm", "Cool", "Wet", "Heavy"], answer: "Cool" }
      ]
    },
    "Poonam’s Day Out": {
      content: `<h3><strong>Main focus: Observation of animals in the surroundings</strong></h3>
<p><strong>Chapter summary:</strong> Poonam stays at home because she is sick, but she observes many animals in her garden. She sees birds on trees, insects on leaves, and animals near the pond. We learn that animals live in different places: some on land, some in water, and some on trees. This chapter builds <strong>observation skills</strong> and curiosity about nature.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Where animals live: Land, Water, Trees, Air</li>
<li>Animal movements: Walk, Fly, Crawl, Hop, Swim</li>
<li>Sounds made by different animals</li>
<li>Observation of local biodiversity</li>
</ul>`,
      quiz: [
        { question: "Where do fish live?", options: ["Trees", "Land", "Water", "Air"], answer: "Water" },
        { question: "Which animal can hop?", options: ["Snake", "Frog", "Fish", "Elephant"], answer: "Frog" },
        { question: "Birds have ___ to help them fly.", options: ["Fins", "Wings", "Gills", "Hands"], answer: "Wings" },
        { question: "Which of these animals lives on a tree?", options: ["Cow", "Monkey", "Crocodile", "Tiger"], answer: "Monkey" },
        { question: "A snake moves by ___.", options: ["Walking", "Flying", "Crawling", "Swimming"], answer: "Crawling" }
      ]
    },
    "The Plant Fairy": {
      content: `<h3><strong>Main focus: Diversity in plants — leaves, trunks, and flowers</strong></h3>
<p><strong>Chapter summary:</strong> Children play a game called 'The Plant Fairy' where they touch different plants. They notice that plants come in all sizes and shapes. Some have thin trunks, while others have thick ones. Leaves also vary in colour, shape, and margin. We learn to <strong>appreciate the variety</strong> in the plant kingdom and identify plants by their features.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Types of plants: Trees, Shrubs, Herbs, Climbers, Creepers</li>
<li>Parts of a plant: Root, Stem, Leaf, Flower, Fruit</li>
<li>Diversity in leaves: Shape, size, and smell</li>
<li>Texture of tree trunks: Smooth vs Rough</li>
</ul>`,
      quiz: [
        { question: "The part of the plant that makes food is the ___.", options: ["Root", "Stem", "Leaf", "Flower"], answer: "Leaf" },
        { question: "A big, strong plant with a thick trunk is called a ___.", options: ["Herb", "Shrub", "Tree", "Climber"], answer: "Tree" },
        { question: "Leaves are usually ___ in colour.", options: ["Red", "Blue", "Green", "Yellow"], answer: "Green" },
        { question: "Which of these plants needs support to grow up?", options: ["Rose", "Mango", "Money plant", "Grass"], answer: "Money plant" },
        { question: "The thick woody stem of a tree is called the ___.", options: ["Branch", "Trunk", "Twig", "Root"], answer: "Trunk" }
      ]
    },
    "Water O Water": {
      content: `<h3><strong>Main focus: Importance, sources, and forms of water</strong></h3>
<p><strong>Chapter summary:</strong> Water is life! This chapter explores the many uses of water — from quenching thirst to farming and industry. We learn about <strong>sources of water</strong> like rain, rivers, lakes, and ground water. Water exists in three forms: Ice (solid), Water (liquid), and Vapour (gas). We must use water wisely and keep our water bodies clean.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Uses of water in daily life</li>
<li>Natural and man-made sources of water</li>
<li>Forms of water: Solid, Liquid, Gas</li>
<li>Conservation of water: Reduce, Reuse, Recycle</li>
</ul>`,
      quiz: [
        { question: "Which of these is a natural source of water?", options: ["Tap", "Tank", "River", "Bottle"], answer: "River" },
        { question: "The solid form of water is ___.", options: ["Steam", "Rain", "Ice", "Dew"], answer: "Ice" },
        { question: "What is the process of water changing into vapour called?", options: ["Freezing", "Evaporation", "Melting", "Condensation"], answer: "Evaporation" },
        { question: "We should ___ rainwater to use later.", options: ["Waste", "Ignore", "Harvest/Collect", "Throw"], answer: "Harvest/Collect" },
        { question: "Water is needed by ___.", options: ["Only humans", "Only plants", "Only animals", "All living things"], answer: "All living things" }
      ]
    },
    "Our First School": {
      content: `<h3><strong>Main focus: Family as the primary source of learning</strong></h3>
<p><strong>Chapter summary:</strong> Before we go to a real school, our <strong>family</strong> is our first school. We learn our first words, manners, and habits from our family members. We learn to love, share, and respect others at home. This chapter highlights that family values form the foundation of our personality.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Family as the 'First School'</li>
<li>Learning values and habits from elders</li>
<li>Similarities between family members (heredity)</li>
<li>Helping each other in the family</li>
</ul>`,
      quiz: [
        { question: "Which is our first school?", options: ["Play school", "Primary school", "Family", "Library"], answer: "Family" },
        { question: "We learn ___ from our family.", options: ["Only math", "Good manners and values", "Only games", "Nothing"], answer: "Good manners and values" },
        { question: "Family members often look like each other; this is called ___.", options: ["Acting", "Similarity", "Magic", "Mistake"], answer: "Similarity" },
        { question: "Helping our parents at home is a ___ habit.", options: ["Bad", "Good", "Funny", "Strange"], answer: "Good" },
        { question: "Who are the first teachers of a child?", options: ["School teachers", "Friends", "Family members", "Neighbours"], answer: "Family members" }
      ]
    },
    "Chhotu’s House": {
      content: `<h3><strong>Main focus: Concept of a house becoming a home</strong></h3>
<p><strong>Chapter summary:</strong> Chhotu comes to Mumbai and uses a big pipe as his house. He divides the pipe into different areas for sleeping, cooking, and sitting. We learn that a <strong>house</strong> is just a building, but it becomes a <strong>home</strong> when we live there with love and care. We also learn about the different parts of a house and the importance of cleanliness.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Difference between House and Home</li>
<li>Parts of a house: Kitchen, Bedroom, Bathroom, Courtyard</li>
<li>Decorating and cleaning the house</li>
<li>Animals that live in our houses (invited and uninvited)</li>
</ul>`,
      quiz: [
        { question: "What did Chhotu use as his house in Mumbai?", options: ["A tent", "A big pipe", "A hut", "A building"], answer: "A big pipe" },
        { question: "A house becomes a home when ___.", options: ["It is very big", "It has many toys", "People live there with love", "It is expensive"], answer: "People live there with love" },
        { question: "Which of these is an 'uninvited' guest in our house?", options: ["Pet dog", "Cat", "Lizard", "Parrot"], answer: "Lizard" },
        { question: "We cook food in the ___.", options: ["Bedroom", "Bathroom", "Kitchen", "Drawing room"], answer: "Kitchen" },
        { question: "On festivals, we ___ our houses.", options: ["Break", "Dirty", "Decorate", "Hide"], answer: "Decorate" }
      ]
    },
    "Foods We Eat": {
      content: `<h3><strong>Main focus: Diversity in food habits and sources</strong></h3>
<p><strong>Chapter summary:</strong> People eat different types of food based on where they live and what is available. Some eat rice, while others eat wheat or millets. We learn that some people are <strong>vegetarians</strong> and some are <strong>non-vegetarians</strong>. It is important to eat a variety of foods to get all the nutrients our body needs.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Food from Plants vs Food from Animals</li>
<li>Staple foods in different regions</li>
<li>Eating habits of people of different ages (infants, adults, elders)</li>
<li>Importance of a balanced diet</li>
</ul>`,
      quiz: [
        { question: "Which of these is a plant-based food?", options: ["Milk", "Eggs", "Pulses/Dal", "Meat"], answer: "Pulses/Dal" },
        { question: "People who do not eat meat or fish are called ___.", options: ["Non-vegetarians", "Vegetarians", "Doctors", "Farmers"], answer: "Vegetarians" },
        { question: "Rice is the main food in ___ India.", options: ["North", "South", "West", "Central"], answer: "South" },
        { question: "What should a small baby mainly drink?", options: ["Juice", "Milk", "Tea", "Soda"], answer: "Milk" },
        { question: "Wheat is used to make ___.", options: ["Rice", "Chapati/Roti", "Idli", "Dosa"], answer: "Chapati/Roti" }
      ]
    },
    "Saying Without Speaking": {
      content: `<h3><strong>Main focus: Non-verbal communication — gestures and expressions</strong></h3>
<p><strong>Chapter summary:</strong> We don't always need words to talk! Our face and hands can tell a lot. People who cannot speak or hear use <strong>Sign Language</strong>. Dancers use <strong>Mudras</strong> (hand gestures) and <strong>Bhavas</strong> (facial expressions) to tell stories. This chapter teaches empathy and the power of non-verbal communication.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Sign Language and its importance</li>
<li>Facial expressions: Happy, Sad, Angry, Surprised</li>
<li>Mudras and Bhavas in dance</li>
<li>Communicating through actions</li>
</ul>`,
      quiz: [
        { question: "How do people who cannot hear or speak communicate?", options: ["Shouting", "Sign Language", "Running", "Writing only"], answer: "Sign Language" },
        { question: "Hand gestures in dance are called ___.", options: ["Steps", "Mudras", "Styles", "Songs"], answer: "Mudras" },
        { question: "Our ___ can show if we are happy or sad without speaking.", options: ["Feet", "Hands", "Face", "Back"], answer: "Face" },
        { question: "To show 'Yes' without speaking, we usually ___.", options: ["Shake head side to side", "Nod head up and down", "Close eyes", "Jump"], answer: "Nod head up and down" },
        { question: "Facial expressions in dance are called ___.", options: ["Mudras", "Bhavas", "Music", "Rhythm"], answer: "Bhavas" }
      ]
    },
    "Flying High": {
      content: `<h3><strong>Main focus: Common birds — their features and habitats</strong></h3>
<p><strong>Chapter summary:</strong> The sky is full of beautiful birds! Each bird has unique features: the Peacock has a colourful tail, the Parrot has a red beak, and the Woodpecker has a strong beak to tap on trees. We learn about what birds eat, how they fly, and where they build their nests. Birds are an important part of our environment.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Identifying birds by feathers, beaks, and feet</li>
<li>Eating habits of birds: Seeds, insects, fruit, fish</li>
<li>Nests: Homes of birds</li>
<li>The National Bird of India: Peacock</li>
</ul>`,
      quiz: [
        { question: "Which bird is known for its beautiful dance in the rain?", options: ["Sparrow", "Peacock", "Crow", "Parrot"], answer: "Peacock" },
        { question: "A bird that can see at night is the ___.", options: ["Eagle", "Owl", "Pigeon", "Duck"], answer: "Owl" },
        { question: "Which bird has a hooked red beak and likes to eat chillies?", options: ["Crow", "Parrot", "Swan", "Crane"], answer: "Parrot" },
        { question: "Birds use their ___ to eat food.", options: ["Teeth", "Beaks", "Hands", "Paws"], answer: "Beaks" },
        { question: "A bird that makes its nest in the hollow of a tree is the ___.", options: ["Woodpecker", "Tailor bird", "Weaver bird", "Eagle"], answer: "Woodpecker" }
      ]
    },
    "It’s Raining": {
      content: `<h3><strong>Main focus: The water cycle and its effect on life</strong></h3>
<p><strong>Chapter summary:</strong> Appu the elephant loves bananas and waters the trees when they are dry. But where does the rain come from? We learn about clouds and how they bring rain. Rain is important for plants, animals, and humans. Without rain, the earth would become dry and life would be difficult. We also learn about the joy of seeing a rainbow!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Importance of rain for plants and animals</li>
<li>How clouds are formed (Basic idea)</li>
<li>The Rainbow: Seven colours after rain</li>
<li>Caring for plants during dry weather</li>
</ul>`,
      quiz: [
        { question: "Who watered the banana trees in the story?", options: ["A boy", "Appu the elephant", "The rain only", "A farmer"], answer: "Appu the elephant" },
        { question: "Clouds bring ___.", options: ["Snow only", "Rain", "Dust", "Sweets"], answer: "Rain" },
        { question: "How many colours are there in a rainbow?", options: ["5", "6", "7", "8"], answer: "7" },
        { question: "When it rains, the parched earth becomes ___.", options: ["Dry", "Green and fresh", "Yellow", "Hot"], answer: "Green and fresh" },
        { question: "We see a rainbow when there is both ___ and rain.", options: ["Wind", "Sunlight", "Night", "Clouds only"], answer: "Sunlight" }
      ]
    },
    "Good Morning": {
      content: "Welcome to the lesson on Good Morning! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Good Morning?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Good Morning?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Magic Garden": {
      content: "Welcome to the lesson on The Magic Garden! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Magic Garden?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Magic Garden?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Bird Talk": {
      content: "Welcome to the lesson on Bird Talk! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bird Talk?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bird Talk?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Nina and the Baby Sparrows": {
      content: "Welcome to the lesson on Nina and the Baby Sparrows! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Nina and the Baby Sparrows?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Nina and the Baby Sparrows?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Little by Little": {
      content: "Welcome to the lesson on Little by Little! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Little by Little?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Little by Little?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Enormous Turnip": {
      content: "Welcome to the lesson on The Enormous Turnip! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Enormous Turnip?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Enormous Turnip?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Sea Song": {
      content: "Welcome to the lesson on Sea Song! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Sea Song?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Sea Song?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "A Little Fish Story": {
      content: "Welcome to the lesson on A Little Fish Story! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in A Little Fish Story?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from A Little Fish Story?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Balloon Man": {
      content: "Welcome to the lesson on The Balloon Man! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Balloon Man?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Balloon Man?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Yellow Butterfly": {
      content: "Welcome to the lesson on The Yellow Butterfly! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Yellow Butterfly?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Yellow Butterfly?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Kakkoo": {
      content: "Welcome to the lesson on Kakkoo! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Kakkoo?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Kakkoo?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Shekhibaz Makkhi": {
      content: "Welcome to the lesson on Shekhibaz Makkhi! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Shekhibaz Makkhi?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Shekhibaz Makkhi?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Chand Wali Amma": {
      content: "Welcome to the lesson on Chand Wali Amma! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Chand Wali Amma?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Chand Wali Amma?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Mann Karta Hai": {
      content: "Welcome to the lesson on Mann Karta Hai! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Mann Karta Hai?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Mann Karta Hai?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Bahadur Bittu": {
      content: "Welcome to the lesson on Bahadur Bittu! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bahadur Bittu?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bahadur Bittu?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Humse Sab Kehte": {
      content: "Welcome to the lesson on Humse Sab Kehte! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Humse Sab Kehte?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Humse Sab Kehte?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Tip Tipwa": {
      content: "Welcome to the lesson on Tip Tipwa! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Tip Tipwa?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Tip Tipwa?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Bandar Bant": {
      content: "Welcome to the lesson on Bandar Bant! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Bandar Bant?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Bandar Bant?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Akbar Birbal": {
      content: "Welcome to the lesson on Akbar Birbal! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Akbar Birbal?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Akbar Birbal?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Where to Look From": {
      content: `<h3><strong>Main focus: Observing objects from different directions</strong></h3>
<p><strong>Chapter summary:</strong> The same object looks different depending on where you look from! A cup seen from the <strong>top</strong> looks like a circle. Seen from the <strong>side</strong>, it looks like a rectangle. This chapter trains us to observe, visualise, and think about <strong>3D shapes from different viewpoints</strong> — a key skill in geometry.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Objects look different from <strong>top view</strong>, <strong>side view</strong>, and <strong>front view</strong></li>
<li>A cup from the top looks like a circle</li>
<li>A box from the side may look like a rectangle</li>
<li>Observation and visualisation are key geometry skills</li>
</ul>`,
      quiz: [
        { question: "A cup viewed from the TOP looks like ___.", options: ["A rectangle", "A triangle", "A circle", "A square"], answer: "A circle" },
        { question: "Why does the same object look different from different angles?", options: ["The object changes shape", "We see different faces/sides of it", "Our eyes are wrong", "The colour changes"], answer: "We see different faces/sides of it" },
        { question: "A brick seen from the SIDE looks like ___.", options: ["A circle", "A triangle", "A rectangle", "A star"], answer: "A rectangle" },
        { question: "The skill of imagining how an object looks from another angle is called ___.", options: ["Addition", "Visualisation", "Subtraction", "Measurement"], answer: "Visualisation" },
        { question: "Looking at a book from the TOP, you would see ___.", options: ["The spine", "The pages inside", "A flat rectangle", "Nothing"], answer: "A flat rectangle" }
      ]
    },
    "Fun with Numbers": {
      content: `<h3><strong>Main focus: Numbers 21–999 and place value</strong></h3>
<p><strong>Chapter summary:</strong> We extend our number knowledge to 3-digit numbers! 100 = 10 Tens = 1 Hundred. A 3-digit number has a <strong>Hundreds place, Tens place, and Ones place</strong>. In 354, there are 3 Hundreds, 5 Tens, and 4 Ones. We also compare and order these larger numbers.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>100 = 10 Tens = 1 Hundred</li>
<li>3-digit number: <strong>Hundreds | Tens | Ones</strong></li>
<li>354 = 300 + 50 + 4 = 3 Hundreds + 5 Tens + 4 Ones</li>
<li>Compare 3-digit numbers by Hundreds digit first</li>
</ul>`,
      quiz: [
        { question: "How many Tens make 1 Hundred?", options: ["1", "100", "10", "1000"], answer: "10" },
        { question: "In the number 472, which digit is in the Hundreds place?", options: ["7", "2", "4", "47"], answer: "4" },
        { question: "354 = 3 Hundreds + 5 Tens + ___ Ones", options: ["53", "35", "3", "4"], answer: "4" },
        { question: "Which is bigger: 582 or 528?", options: ["528", "582", "Both equal", "Cannot say"], answer: "582" },
        { question: "What is the place value of 6 in 631?", options: ["6", "60", "600", "6000"], answer: "600" }
      ]
    },
    "Long and Short": {
      content: `<h3><strong>Main focus: Standard units of length — centimetre and metre</strong></h3>
<p><strong>Chapter summary:</strong> We learned to measure with footsteps and handspans, but these are different for everyone. Now we use <strong>standard units</strong>: the <strong>centimetre (cm)</strong> for small lengths and the <strong>metre (m)</strong> for bigger lengths. 100 cm = 1 m. A ruler has centimetre markings. We use these to measure accurately.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Standard units: <strong>centimetre (cm)</strong> and <strong>metre (m)</strong></li>
<li>100 cm = 1 metre</li>
<li>Small things: measured in cm (pencil, book)</li>
<li>Big things: measured in m (room, road)</li>
</ul>`,
      quiz: [
        { question: "How many centimetres make 1 metre?", options: ["10", "1000", "100", "50"], answer: "100" },
        { question: "We measure the length of a pencil in ___.", options: ["Metres", "Kilometres", "Litres", "Centimetres"], answer: "Centimetres" },
        { question: "We measure the length of a football field in ___.", options: ["Centimetres", "Grams", "Litres", "Metres"], answer: "Metres" },
        { question: "A ruler shows markings in ___.", options: ["Kilograms", "Centimetres", "Litres", "Seconds"], answer: "Centimetres" },
        { question: "Why do we use standard units of measurement?", options: ["To make maths harder", "So everyone gets the same answer for the same length", "To use our hands and feet", "To avoid counting"], answer: "So everyone gets the same answer for the same length" }
      ]
    },
    "Shapes and Designs": {
      content: `<h3><strong>Main focus: 2D shapes, symmetry, and tiling patterns</strong></h3>
<p><strong>Chapter summary:</strong> We study 2D shapes: <strong>triangle, square, rectangle, circle, hexagon</strong>. We learn how shapes can <strong>tile</strong> (fit together without gaps). We also explore <strong>symmetry</strong>: a shape is symmetric if one half is the mirror image of the other. A square has 4 lines of symmetry!</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>2D shapes: triangle (3 sides), square (4 equal sides), rectangle, circle, hexagon (6 sides)</li>
<li><strong>Tiling</strong>: shapes that fit together with no gaps or overlaps</li>
<li><strong>Symmetry</strong>: a shape is symmetric when both halves match</li>
<li>A square has <strong>4 lines of symmetry</strong></li>
</ul>`,
      quiz: [
        { question: "How many sides does a hexagon have?", options: ["4", "5", "8", "6"], answer: "6" },
        { question: "A shape is symmetric when ___.", options: ["Both halves match exactly", "It has no sides", "It has 3 corners", "It is colourful"], answer: "Both halves match exactly" },
        { question: "Which shape tiles perfectly (fits together with no gaps)?", options: ["Circle", "Square", "Star", "Crescent"], answer: "Square" },
        { question: "How many lines of symmetry does a square have?", options: ["1", "2", "3", "4"], answer: "4" },
        { question: "A triangle has ___ sides.", options: ["4", "2", "6", "3"], answer: "3" }
      ]
    },
    "Fun with Give and Take": {
      content: `<h3><strong>Main focus: Addition and subtraction of 3-digit numbers</strong></h3>
<p><strong>Chapter summary:</strong> We now add and subtract bigger numbers! For <strong>213 + 45</strong>, we add Ones first (3+5=8), then Tens (1+4=5), then Hundreds (2+0=2) to get 258. For subtraction, we do the same in reverse. We also learn about <strong>carrying</strong> (regrouping) when the sum in a column exceeds 9.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Add column by column: Ones → Tens → Hundreds</li>
<li>213 + 45 = 258</li>
<li>Subtract column by column: Ones → Tens → Hundreds</li>
<li><strong>Carrying / Regrouping</strong>: when Ones sum > 9, carry 1 to Tens</li>
</ul>`,
      quiz: [
        { question: "213 + 45 = ___", options: ["248", "258", "268", "168"], answer: "258" },
        { question: "When adding two numbers, which column do we start with?", options: ["Hundreds", "Tens", "Ones", "Any column"], answer: "Ones" },
        { question: "356 − 124 = ___", options: ["232", "222", "242", "480"], answer: "232" },
        { question: "When the sum of two Ones digits is more than 9, we ___ to the Tens column.", options: ["Subtract 1", "Carry 1", "Write 0", "Skip it"], answer: "Carry 1" },
        { question: "What is 400 + 50 + 7?", options: ["475", "4507", "457", "407"], answer: "457" }
      ]
    },
    "Time Goes On": {
      content: `<h3><strong>Main focus: Reading a clock — hours and minutes</strong></h3>
<p><strong>Chapter summary:</strong> Time is measured using a <strong>clock</strong>. The <strong>short hand</strong> shows the hour and the <strong>long hand</strong> shows the minutes. When the long hand points to 12, it is <strong>o'clock</strong>. When it points to 6, it is <strong>half past</strong>. There are 60 minutes in 1 hour and 24 hours in 1 day.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li><strong>Short hand</strong> = hours; <strong>Long hand</strong> = minutes</li>
<li>Long hand at 12 → o'clock (e.g. 3 o'clock)</li>
<li>Long hand at 6 → half past (e.g. half past 3)</li>
<li>60 minutes = 1 hour; 24 hours = 1 day</li>
</ul>`,
      quiz: [
        { question: "The short hand on a clock shows the ___.", options: ["Minutes", "Seconds", "Hours", "Days"], answer: "Hours" },
        { question: "When the long hand points to 12, the time is ___.", options: ["Half past", "Quarter past", "O'clock", "Quarter to"], answer: "O'clock" },
        { question: "How many minutes are in 1 hour?", options: ["24", "100", "30", "60"], answer: "60" },
        { question: "When the long hand points to 6, the time is ___.", options: ["O'clock", "Quarter past", "Half past", "Quarter to"], answer: "Half past" },
        { question: "How many hours are in 1 day?", options: ["12", "60", "24", "48"], answer: "24" }
      ]
    },
    "Who is Heavier?": {
      content: `<h3><strong>Main focus: Comparing weights using a balance</strong></h3>
<p><strong>Chapter summary:</strong> We use a <strong>balance scale</strong> to compare weights. The heavier side goes DOWN and the lighter side goes UP. We measure weight using non-standard units (like marbles or blocks) or standard units. We compare objects and use words: <strong>Heavier / Lighter / Equal</strong>.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>A balance shows which side is <strong>heavier</strong> (it sinks down)</li>
<li>Words: <strong>Heavier, Lighter, Equal</strong></li>
<li>Non-standard units: stones, books, marbles</li>
<li>If both sides of a balance are level, the weight is <strong>equal</strong></li>
</ul>`,
      quiz: [
        { question: "On a balance scale, which side goes down?", options: ["The lighter side", "The heavier side", "Both sides", "Neither side"], answer: "The heavier side" },
        { question: "Which is lighter: a feather or a brick?", options: ["Brick", "Feather", "Both equal", "Cannot tell"], answer: "Feather" },
        { question: "If both sides of a balance are level, the weights are ___.", options: ["Different", "Equal", "Heavier", "Lighter"], answer: "Equal" },
        { question: "A spoon weighs 2 blocks. A cup weighs 6 blocks. Which is heavier?", options: ["Spoon", "Block", "Cup", "Both equal"], answer: "Cup" },
        { question: "We use a ___ to compare two weights.", options: ["Ruler", "Clock", "Balance scale", "Handspan"], answer: "Balance scale" }
      ]
    },
    "How Many Times?": {
      content: `<h3><strong>Main focus: Skip counting as the foundation of multiplication</strong></h3>
<p><strong>Chapter summary:</strong> "How Many Times?" introduces repeated groups. If there are 3 groups of 4 coins, we skip-count by 4: 4, 8, 12. This is secret multiplication! We also look at patterns in skip counting — counting by 2s always gives even numbers. Counting by 5s always ends in 0 or 5.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>3 groups of 4 = 4 + 4 + 4 = 12 (skip count by 4 three times)</li>
<li>Counting by 2s → always even: 2, 4, 6, 8, 10…</li>
<li>Counting by 5s → ends in 0 or 5: 5, 10, 15, 20…</li>
<li>Skip counting is the building block of multiplication tables</li>
</ul>`,
      quiz: [
        { question: "Count by 2s: 2, 4, 6, ___, ___", options: ["7, 8", "8, 10", "8, 9", "9, 11"], answer: "8, 10" },
        { question: "There are 4 groups of 3 stars each. How many stars in total?", options: ["7", "9", "12", "16"], answer: "12" },
        { question: "Count by 5s: 5, 10, 15, ___, ___", options: ["16, 17", "20, 25", "18, 20", "19, 24"], answer: "20, 25" },
        { question: "When counting by 5s, the numbers always end in ___.", options: ["2 or 4", "0 or 5", "1 or 3", "6 or 8"], answer: "0 or 5" },
        { question: "3 groups of 2 cherries each gives us ___ cherries in total.", options: ["5", "3", "2", "6"], answer: "6" }
      ]
    },
    "Play with Patterns": {
      content: `<h3><strong>Main focus: Identifying and extending patterns in shapes, colours, and numbers</strong></h3>
<p><strong>Chapter summary:</strong> Patterns follow a <strong>rule that repeats</strong>. We find patterns on tiles, fabric, and in number sequences. The key skill is finding the <strong>repeating unit</strong> and then extending it. Number patterns like 2, 4, 6, 8 (add 2 each time) or 5, 10, 15, 20 (add 5 each time) are very useful in maths.</p>
<h3><strong>Key concepts:</strong></h3>
<ul>
<li>Find the <strong>repeating unit</strong> in a pattern</li>
<li>Colour patterns, shape patterns, number patterns</li>
<li>Growing patterns: 1, 3, 5, 7 (add 2 each time)</li>
<li>Patterns on tiles, sarees, and floor designs</li>
</ul>`,
      quiz: [
        { question: "What is the rule for: 1, 3, 5, 7, 9?", options: ["Add 1", "Add 3", "Add 2", "Subtract 1"], answer: "Add 2" },
        { question: "Complete the pattern: Red, Blue, Green, Red, Blue, ___", options: ["Red", "Blue", "Yellow", "Green"], answer: "Green" },
        { question: "Pattern: ○ □ ○ □ ___. What comes next?", options: ["□", "△", "○", "★"], answer: "○" },
        { question: "Which of these is a pattern counting by 10s?", options: ["1, 2, 3, 4", "2, 4, 6, 8", "10, 20, 30, 40", "5, 10, 15, 20"], answer: "10, 20, 30, 40" },
        { question: "Patterns are found on ___.", options: ["Only paper", "Only numbers", "Tiles, fabric, and in numbers", "Only in classrooms"], answer: "Tiles, fabric, and in numbers" }
      ]
    },
    "Poonam’s Day Out": {
      content: "Welcome to the lesson on Poonam’s Day Out! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Poonam’s Day Out?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Poonam’s Day Out?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "The Plant Fairy": {
      content: "Welcome to the lesson on The Plant Fairy! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in The Plant Fairy?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from The Plant Fairy?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Water O Water": {
      content: "Welcome to the lesson on Water O Water! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Water O Water?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Water O Water?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Our First School": {
      content: "Welcome to the lesson on Our First School! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Our First School?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Our First School?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Chhotu’s House": {
      content: "Welcome to the lesson on Chhotu’s House! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Chhotu’s House?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Chhotu’s House?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Foods We Eat": {
      content: "Welcome to the lesson on Foods We Eat! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Foods We Eat?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Foods We Eat?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Saying Without Speaking": {
      content: "Welcome to the lesson on Saying Without Speaking! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Saying Without Speaking?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Saying Without Speaking?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Flying High": {
      content: "Welcome to the lesson on Flying High! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in Flying High?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from Flying High?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "It’s Raining": {
      content: "Welcome to the lesson on It’s Raining! This chapter will teach you fascinating things about this topic. Pay close attention to the stories and concepts.",
      quiz: [
        { question: "What is a key concept in It’s Raining?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { question: "What do we learn from It’s Raining?", options: ["Values", "Numbers", "Language", "Nature"], answer: "Values" }
      ]
    },
    "Meena’s Family": {
      content: `<h3><strong>अध्याय 1: मीना का परिवार (Meena’s Family)</strong></h3>
<p><strong>पाठ का सारांश:</strong> यह अध्याय मीना नाम की एक लड़की के माध्यम से परिवार की अवधारणा को समझाता है। यह बच्चों को परिवार के सदस्यों को हिंदी में पहचानने और नाम देने में मदद करता है। यह पाठ परिवार के भीतर प्यार और जुड़ाव पर ध्यान केंद्रित करता है। इस अध्याय में, हम रिश्तों के लिए बुनियादी शब्द सीखते हैं: माँ, पिता, भाई, और दादा-दादी। बच्चों को 'मीना' और 'माँ' जैसे नामों के माध्यम से 'म' और 'न' वर्णों को पहचानना सिखाया जाता है।</p>
<p>This chapter introduces the concept of a family through a girl named Meena. It teaches children to identify and name family members in Hindi. The lesson focuses on the love and bond within a family.</p>`,
      quiz: [
        { question: "आपके परिवार में कौन-कौन है?", options: ["दोस्त", "माता-पिता और भाई-बहन", "सिर्फ मैं", "पड़ोसी"], answer: "माता-पिता और भाई-बहन" },
        { question: "'म' अक्षर से शुरू होने वाले दो शब्द कौन से हैं?", options: ["नल, नदी", "माँ, मीना", "घर, घड़ी", "सेब, संतरा"], answer: "माँ, मीना" },
        { question: "मीना के भाई का क्या नाम है?", options: ["नितिन", "राज", "अमित", "राहुल"], answer: "नितिन" },
        { question: "Maa शब्द का हिंदी अर्थ क्या है?", options: ["पिता", "भाई", "माँ", "बहन"], answer: "माँ" },
        { question: "दादा-दादी हमारे परिवार के ___ सदस्य हैं।", options: ["छोटे", "बड़े और बुजुर्ग", "बाहरी", "नए"], answer: "बड़े और बुजुर्ग" }
      ],
      lessons: [
        { title: "Introduction: मेरा परिवार", explanation: "परिवार वह जगह है जहाँ हम सबसे पहले प्यार और देखभाल सीखते हैं। मीना का परिवार एक सुखी परिवार है। उसके घर में सब मिल-जुलकर रहते हैं।\n\nA family is where we first learn love and care. Meena's family is a happy one where everyone lives together.", words: ["परिवार (Family)", "प्यार (Love)", "घर (Home)"], activities: "अपने परिवार के सदस्यों के नाम हिंदी में लिखें।" },
        { title: "Letter Focus: 'म' और 'न'", explanation: "इस पाठ में हम 'म' से 'माँ' और 'न' से 'नल' जैसे शब्दों को पहचानना सीखेंगे। वर्णों की पहचान भाषा सीखने का पहला कदम है।\n\nRecognizing letters like 'Ma' and 'Na' is the first step in learning a language.", words: ["माँ", "नल", "मछली", "नमक"], activities: "'म' अक्षर से शुरू होने वाले 5 शब्द बोलें।" },
        { title: "Concept: रिश्तों के नाम", explanation: "माँ, पिता, भाई, बहन, दादा और दादी - ये हमारे परिवार के मुख्य सदस्य हैं। हर रिश्ते का अपना महत्व है।\n\nMother, Father, Brother, Sister, Grandfather, and Grandmother are key family members.", words: ["पिता", "भाई", "बहन", "रिश्ता"], activities: "अपने पसंदीदा परिवार के सदस्य के बारे में एक वाक्य बोलें।" },
        { title: "Speaking: नमस्ते और बातचीत", explanation: "जब हम अपने बड़ों से मिलते हैं, तो हमें 'नमस्ते' कहना चाहिए। यह विनम्रता और संस्कार की निशानी है।\n\nSaying 'Namaste' to elders is a sign of politeness and good values.", words: ["नमस्ते", "विनम्रता", "बातचीत"], activities: "अपने घर में सबको 'नमस्ते' कहें।" },
        { title: "Writing Practice", explanation: "मीना और माँ शब्दों में 'म' वर्ण आता है। चलिए इसे सुंदर तरीके से लिखने का अभ्यास करते हैं।\n\nThe letter 'Ma' appears in Meena and Maa. Let's practice writing it beautifully.", words: ["लिखना", "सुंदर", "अभ्यास"], activities: "'म' और 'न' वर्ण को 10 बार लिखें।" },
        { title: "Review: मीना का घर", explanation: "हमने मीना के परिवार के बारे में जाना और 'म' व 'न' अक्षर सीखे। परिवार का साथ सबसे सुखद होता है।\n\nWe learned about Meena's family and the letters Ma and Na. Family support is the best.", words: ["सुखद", "साथ", "सीख"], activities: "अध्याय 1 के सभी प्रश्नों को हल करें।" }
      ]
    },

    "Grandparents": {
      content: `<h3><strong>अध्याय 2: दादा-दादी (Grandparents)</strong></h3>
<p><strong>पाठ का सारांश:</strong> यह अध्याय दादा-दादी की भूमिका के बारे में एक सुंदर कविता है। यह बच्चों को बड़ों द्वारा साझा की गई कहानियों और ज्ञान के बारे में सिखाता है। मुख्य ध्यान 'द' और 'ई' वर्णों की ध्वन्यात्मक जागरूकता पर है। बच्चे सीखते हैं कि दादा-दादी खास दोस्त होते हैं जो उनका ख्याल रखते हैं। यह पाठ बच्चों को बड़ों का सम्मान करने और उनके साथ समय बिताने के लिए प्रोत्साहित करता है। यह 'दादा' और 'दादी' जैसे शब्दों के माध्यम से 'आ' की मात्रा से भी परिचय कराता है।</p>
<p>This chapter is a beautiful poem about the role of grandparents. It teaches children about the stories and wisdom shared by elders. The focus is on phonetic awareness of the letter 'द' (Da) and 'ई' (Ee).</p>`,
      quiz: [
        { question: "दादा-दादी आपको कौन सी कहानियाँ सुनाते हैं?", options: ["जंगल की", "पुरानी और ज्ञान वाली", "भूत की", "सिर्फ डरावनी"], answer: "पुरानी और ज्ञान वाली" },
        { question: "'द' अक्षर पर गोला लगाएँ: [म, द, न, र, स]", options: ["म", "द", "न", "स"], answer: "द" },
        { question: "दादी शब्द का तुकबंदी वाला शब्द क्या है?", options: ["नानी", "शादी", "पानी", "हाथी"], answer: "शादी" },
        { question: "दादाजी क्या पहनते हैं?", options: ["कुर्ता-पायजामा / धोती", "जीन्स", "ट्रैकसूट", "कोट-पेंट"], answer: "कुर्ता-पायजामा / धोती" },
        { question: "बड़ों का हमें क्या करना चाहिए?", options: ["शोर", "सम्मान", "परेशान", "गुस्सा"], answer: "सम्मान" }
      ],
      lessons: [
        { title: "Introduction: प्यारी कविता", explanation: "दादा-दादी घर के सबसे बुजुर्ग and अनुभवी सदस्य होते हैं। उनकी बातें कहानियों जैसी होती हैं।\n\nGrandparents are the elders and most experienced. Their talks are like stories.", words: ["बुजुर्ग", "अनुभव", "प्यारी"], activities: "अपने दादा-दादी के साथ एक फोटो खिंचवाएं।" },
        { title: "Letter Focus: 'द' और 'ई'", explanation: "इस पाठ में हम 'द' से 'दाल' और 'ई' की मात्रा वाले शब्दों जैसे 'दादी' को सीखेंगे।\n\nIn this lesson, we learn 'Da' for 'Dal' and the 'Ee' vowel sign.", words: ["दाल", "दीपक", "दादी", "ई"], activities: "'द' अक्षर से शुरू होने वाले 3 शब्द लिखें।" },
        { title: "Concept: कहानियों का पिटारा", explanation: "दादा-दादी हमें परियों, राजाओं और पुराने समय की कहानियाँ सुनाते हैं। ये कहानियाँ हमें बहुत कुछ सिखाती हैं।\n\nGrandparents tell us stories of fairies, kings, and old times that teach us a lot.", words: ["पिटारा", "परी", "राजा"], activities: "अपनी पसंदीदा कहानी का नाम बताएं।" },
        { title: "Grammar: 'आ' की मात्रा", explanation: "'दादा' शब्द में 'ा' की मात्रा लगी है। यह मात्रा आवाज़ को लंबी कर देती है।\n\nThe 'Aa' matra in 'Dada' makes the sound longer.", words: ["मात्रा", "आवाज़", "लंबी"], activities: "'ा' की मात्रा वाले 5 शब्द लिखें।" },
        { title: "Value: बड़ों का सम्मान", explanation: "हमें हमेशा अपने बड़ों का आदर करना चाहिए और उनकी मदद करनी चाहिए।\n\nWe should always respect our elders and help them.", words: ["सम्मान", "आदर", "मदद"], activities: "आज अपने दादा-दादी के पैर छुएं।" },
        { title: "Review: दादा-दादी का घर", explanation: "दादा-दादी के साथ समय बिताना बहुत सुखद होता है। हमने 'द' और 'ई' वर्ण भी सीखे।\n\nSpending time with grandparents is joyful. We also learned Da and Ee.", words: ["सुखद", "समय", "सीख"], activities: "अध्याय 2 के तुकबंदी वाले शब्द लिखें।" }
      ]
    },
    "Welcoming Reema": {
      content: `<h3><strong>अध्याय 3: रीमा का स्वागत (Welcoming Reema)</strong></h3>
<p><strong>पाठ का सारांश:</strong> यह अध्याय रीमा नाम की एक नई लड़की के समूह में शामिल होने के बारे में है। यह बच्चों को विनम्र होना और नए दोस्तों का स्वागत करना सिखाता है। यहाँ सिखाया जाने वाला मुख्य सामाजिक कौशल 'आतिथ्य' (मेहमानों का स्वागत) है। भाषाई रूप से, यह 'र' और 'स' वर्णों का परिचय देता है। छात्र "नमस्ते" और "आइए" जैसे वाक्यांशों का उपयोग करना सीखते हैं। यह छोटे वाक्य बनाने में मदद करता है और कक्षा में सामाजिक मेलजोल को बढ़ावा देता है।</p>
<p>This chapter talks about a new girl, Reema, joining a group. It teaches children how to be polite and welcome new friends. Social skill: 'Hospitality'. Letters: 'र' (Ra) and 'स' (Sa).</p>`,
      quiz: [
        { question: "जब कोई घर आता है तो आप क्या कहते हैं?", options: ["नमस्ते, आइए", "जाओ यहाँ से", "क्यों आए हो", "कुछ नहीं"], answer: "नमस्ते, आइए" },
        { question: "'र' अक्षर से शुरू होने वाला फल है:", options: ["सेब", "रसीला आम (रसभरी)", "केला", "अंगूर"], answer: "रसीला आम (रसभरी)" },
        { question: "'नमस्ते' का क्या अर्थ है?", options: ["नमस्ते/प्रणाम", "खेलना", "खाना", "सोना"], answer: "नमस्ते/प्रणाम" },
        { question: "नए दोस्त बनाने के लिए हमें क्या होना चाहिए?", options: ["गुस्सैल", "विनम्र और मिलनसार", "चुप", "अकेला"], answer: "विनम्र और मिलनसार" },
        { question: "स _ रे _ शब्द को पूरा करें:", options: ["सवेरा", "सपना", "सच", "सड़क"], answer: "सवेरा" }
      ],
      lessons: [
        { title: "Introduction: नई सहेली", explanation: "रीमा आज हमारी कक्षा में नई आई है। नए दोस्तों का स्वागत मुस्कुराकर करना चाहिए।\n\nReema is new in our class. We should welcome new friends with a smile.", words: ["सहेली", "मुस्कुराहट", "नया"], activities: "अपनी नई दोस्त को 'नमस्ते' कहें।" },
        { title: "Letter Focus: 'र' और 'स'", explanation: "'र' से 'रीमा' और 'स' से 'स्वागत'। ये अक्षर आज हमारे मेहमान हैं।\n\n'Ra' for Reema and 'Sa' for Swagat. These letters are our guests today.", words: ["र", "स", "रीमा", "स्वागत"], activities: "'र' और 'स' से शुरू होने वाले दो फल के नाम लिखें।" },
        { title: "Concept: अतिथि सत्कार", explanation: "हमारे देश में मेहमान को भगवान माना जाता है। उन्हें पानी पिलाना और प्यार से बिठाना हमारा कर्तव्य है।\n\nIn our country, guests are considered God. Serving them is our duty.", words: ["अतिथि", "सत्कार", "कर्तव्य"], activities: "घर आए मेहमान को पानी पिलाने का नाटक करें।" },
        { title: "Language: छोटे वाक्य", explanation: "'आइए बैठिए', 'आपका नाम क्या है?' - ऐसे छोटे वाक्यों से हम बातचीत शुरू करते हैं।\n\n'Please sit', 'What is your name?' - we start talking with small sentences.", words: ["बैठिए", "बातचीत", "शुरू"], activities: "अपने दोस्त से उसका नाम पूछें।" },
        { title: "Social Skill: मिलनसार बनें", explanation: "अकेले रहने से अच्छा है सबके साथ मिलकर खेलना। नए लोगों से बात करने से झिझक दूर होती है।\n\nIt's better to play together. Talking to new people removes hesitation.", words: ["मिलनसार", "झिझक", "साथ"], activities: "कक्षा में किसी ऐसे बच्चे से बात करें जिससे आपने पहले बात न की हो।" },
        { title: "Review: रीमा का स्वागत", explanation: "हमने रीमा का स्वागत किया और नए शब्द सीखे। 'र' और 'स' अब हमारे दोस्त हैं।\n\nWe welcomed Reema and learned new words. Ra and Sa are our friends now.", words: ["सफल", "दोस्ती", "सीख"], activities: "अध्याय 3 के सभी प्रश्न हल करें।" }
      ]
    },

    "Wow! My Shoes": {
      content: `<h3><strong>अध्याय 4: वाह! मेरे जूते (Wow! My Shoes)</strong></h3>
<p><strong>पाठ का सारांश:</strong> यह अध्याय एक बच्चे के अपने नए जूतों के प्रति उत्साह के इर्द-गिर्द घूमता है। यह छात्रों को रंगों, आकारों और अपनी चीजों की देखभाल करने के बारे में सिखाता है। ध्यान देने वाले वर्ण 'व' और 'ज' हैं। यह बच्चों को अपने जूते खुद पहनना और उन्हें साफ रखना सिखाकर स्वतंत्र होने के लिए प्रोत्साहित करता है। यह पाठ जोड़ों (बाएं और दाएं) की अवधारणा को भी पेश करता है और बच्चों को "सुnder" (Beautiful) या "Naye" (New) जैसे विशेषणों का उपयोग करके वस्तुओं का वर्णन करने में मदद करता है।</p>
<p>This chapter revolves around a child's excitement for their new shoes. It teaches students about colors, sizes, and taking care of their belongings. Letters: 'व' (Va) and 'ज' (Ja).</p>`,
      quiz: [
        { question: "आपके जूतों का रंग क्या है?", options: ["लाल", "नीला", "काला", "सभी हो सकते हैं"], answer: "सभी हो सकते हैं" },
        { question: "'ज' से शुरू होने वाला शब्द है:", options: ["जल", "नल", "फल", "कल"], answer: "जल" },
        { question: "क्या आप अपने जूते खुद पहन सकते हैं?", options: ["हाँ", "नहीं", "सिर्फ एक", "पता नहीं"], answer: "हाँ" },
        { question: "'सुंदर' शब्द का विलोम क्या है?", options: ["साफ", "बदसूरत", "नया", "बड़ा"], answer: "बदसूरत" },
        { question: "जूते हम कहाँ पहनते हैं?", options: ["हाथ", "पैर", "सिर", "कान"], answer: "पैर" }
      ],
      lessons: [
        { title: "Introduction: सुंदर जूते", explanation: "नए जूते पहनकर बच्चा बहुत उत्साहित है। जूते हमारे पैरों को चोट और धूल से बचाते हैं।\n\nThe child is excited about new shoes. Shoes protect our feet from hurt and dust.", words: ["उत्साहित", "चोट", "धूल"], activities: "अपने जूतों का चित्र बनाएं।" },
        { title: "Letter Focus: 'व' और 'ज'", explanation: "'व' से 'वजन' and 'ज' से 'जूते'। इन वर्णों को पहचानना और लिखना सीखें।\n\nLearn to recognize 'Va' for 'Vajan' and 'Ja' for 'Jute'.", words: ["व", "ज", "वजन", "जूते"], activities: "'व' और 'ज' को अपनी कॉपी में 5 बार लिखें।" },
        { title: "Concept: अपनी चीज़ों की देखभाल", explanation: "जूतों को रोज़ साफ करना चाहिए और उन्हें सही जगह (शू-रैक) पर रखना चाहिए।\n\nClean your shoes daily and keep them in the shoe-rack.", words: ["साफ", "संभालना", "जगह"], activities: "आज अपने जूते खुद पॉलिश या साफ करें।" },
        { title: "Grammar: विलोम शब्द", explanation: "नया का पुराना, सुंदर का बदसूरत, साफ का गंदा। इन्हें विलोम या उल्टा शब्द कहते हैं।\n\nOpposite words: New-Old, Beautiful-Ugly, Clean-Dirty.", words: ["विलोम", "उल्टा", "पुराना"], activities: "5 विलोम शब्दों की जोड़ी बनाएं।" },
        { title: "Independence: खुद पहनना", explanation: "अपने काम खुद करना अच्छी बात है। जूते पहनना और फीते (laces) बाँधना सीखना चाहिए।\n\nDoing your work is good. Learn to wear shoes and tie laces.", words: ["स्वतंत्र", "फीते", "बाँधना"], activities: "जूते पहनने का अभ्यास करें।" },
        { title: "Review: जूतों की कहानी", explanation: "हमने जूतों के बारे में सीखा और 'व' व 'ज' वर्ण जाने। अपनी चीज़ों का ध्यान रखें!\n\nWe learned about shoes and the letters Va and Ja. Take care of your things!", words: ["ध्यान", "कहानी", "सफल"], activities: "अध्याय 4 के सभी प्रश्न हल करें।" }
      ]
    },
  };

  if (specificData[cleanTitle]) {
  let data = specificData[cleanTitle] || specificData[title];
    // If we have detailed lessons and the requested lesson number is valid
    if (data.lessons && data.lessons[lessonNum - 1]) {
      const lesson = data.lessons[lessonNum - 1];
      return {
        title: lesson.title,
        content: `<h3><strong>${lesson.title}</strong></h3><p>${lesson.explanation}</p> ${lesson.words ? `<p><strong>Key words:</strong> ${lesson.words.join(', ')}</p>` : ''} ${lesson.activities ? `<p><strong>Activities:</strong> ${lesson.activities}</p>` : ''}`,
        quiz: data.quiz ? data.quiz.slice(0, 5) : []
      };
    }
    // Fallback to the main content if no specific lesson is found
    return data;
  }



  // --- CLASS 9 & 10 MATH ---
  if (title.includes("Number Systems") || title.includes("Real Numbers")) {
    return {
      content: `A number system is defined as a system of writing to express numbers. It is the mathematical notation for representing numbers of a given set by using digits or other symbols in a consistent manner. It provides a unique representation of every number and represents the arithmetic and algebraic structure of the figures.

Real numbers include both rational and irrational numbers. Rational numbers can be expressed as a fraction p/q, where p and q are integers and q is not zero. Irrational numbers cannot be expressed as simple fractions (e.g., √2, π).`,
      quiz: [
        { question: "Which of the following is an irrational number?", options: ["22/7", "3.14", "π", "4"], answer: "π" },
        { question: "Can a real number be both rational and irrational?", options: ["Yes", "No", "Only if it is zero", "Depends on the system"], answer: "No" }
      ]
    };
  } else if (title.includes("Polynomials")) {
    return {
      content: `A polynomial is an expression consisting of variables and coefficients, that involves only the operations of addition, subtraction, multiplication, and non-negative integer exponentiation of variables. 

For example, x² - 4x + 7 is a polynomial. The highest power of the variable in a polynomial is called the degree of the polynomial. A polynomial of degree 1 is linear, degree 2 is quadratic, and degree 3 is cubic.`,
      quiz: [
        { question: "What is the degree of the polynomial 4x³ + 2x² - 5x + 1?", options: ["1", "2", "3", "4"], answer: "3" },
        { question: "A polynomial of degree 2 is called:", options: ["Linear", "Quadratic", "Cubic", "Biquadratic"], answer: "Quadratic" }
      ]
    }
  } else if (title.includes("Quadratic Equations")) {
    return {
      content: `A quadratic equation is a second-degree polynomial equation in a single variable x, with a standard form of ax² + bx + c = 0, where a, b, and c are constants (and a ≠ 0). 

The solutions to a quadratic equation are called its roots. The roots can be found using the quadratic formula: x = [-b ± √(b² - 4ac)] / 2a. The term (b² - 4ac) is the discriminant, which determines the nature of the roots.`,
      quiz: [
        { question: "What is the standard form of a quadratic equation?", options: ["y = mx + c", "ax + b = 0", "ax² + bx + c = 0", "a² + b² = c²"], answer: "ax² + bx + c = 0" },
        { question: "If the discriminant (b² - 4ac) is less than zero, the roots are:", options: ["Real and equal", "Real and distinct", "Complex/Imaginary", "Zero"], answer: "Complex/Imaginary" }
      ]
    };
  }
  // --- CLASS 9 & 10 SCIENCE ---
  else if (title.includes("Matter in Our Surroundings")) {
    return {
      content: `Matter is anything that occupies space and has mass. Early Indian philosophers classified matter in the form of five basic elements – the “Panch Tatva” – air, earth, fire, sky and water.

Modern day scientists have evolved two types of classification of matter based on their physical properties and chemical nature. Physically, matter exists as solids, liquids, and gases. The particles of matter are very small and have spaces between them. They are continuously moving and attract each other.`,
      quiz: [
        { question: "Which state of matter has a definite volume but no definite shape?", options: ["Solid", "Liquid", "Gas", "Plasma"], answer: "Liquid" },
        { question: "The process of a solid changing directly into a gas is called:", options: ["Evaporation", "Condensation", "Sublimation", "Melting"], answer: "Sublimation" }
      ]
    }
  } else if (title.includes("Motion") || title.includes("Laws of Motion")) {
    return {
      content: `Motion is the change in position of an object over time. It can be described in terms of distance, displacement, speed, velocity, and acceleration.

Sir Isaac Newton formulated three laws of motion:
1. An object at rest stays at rest and an object in motion stays in motion unless acted upon by an unbalanced force (Inertia).
2. Force equals mass times acceleration (F = ma).
3. For every action, there is an equal and opposite reaction.`,
      quiz: [
        { question: "What is the SI unit of acceleration?", options: ["m/s", "m/s²", "km/h", "N"], answer: "m/s²" },
        { question: "Which of Newton's laws is also known as the Law of Inertia?", options: ["First Law", "Second Law", "Third Law", "Law of Gravitation"], answer: "First Law" }
      ]
    }
  } else if (title.includes("Chemical Reactions and Equations")) {
    return {
      content: `A chemical reaction is a process that leads to the chemical transformation of one set of chemical substances to another. When a chemical reaction occurs, we can observe changes in state, color, evolution of a gas, or change in temperature.

A chemical equation is the symbolic representation of a chemical reaction in the form of symbols and formulae. It must be balanced to satisfy the Law of Conservation of Mass, meaning the number of atoms of each element must be the same on both the reactant and product sides.`,
      quiz: [
        { question: "What indicates a chemical reaction has taken place?", options: ["Change in state", "Evolution of a gas", "Change in color", "All of the above"], answer: "All of the above" },
        { question: "Why do we balance chemical equations?", options: ["To conserve volume", "To satisfy the Law of Conservation of Mass", "To make it look symmetric", "To conserve energy"], answer: "To satisfy the Law of Conservation of Mass" }
      ]
    }
  } else if (title.includes("Light") || title.includes("Reflection") || title.includes("Refraction")) {
    return {
      content: `Light is a form of electromagnetic radiation that allows the human eye to see or makes objects visible.

Reflection is the bouncing back of light rays when they hit a smooth, polished surface like a mirror. The angle of incidence equals the angle of reflection.
Refraction is the bending of light when it passes from one transparent medium to another, caused by a change in its speed.`,
      quiz: [
        { question: "The angle of incidence is always equal to:", options: ["The angle of refraction", "The angle of reflection", "The critical angle", "90 degrees"], answer: "The angle of reflection" },
        { question: "The bending of light as it passes from air to water is called:", options: ["Reflection", "Dispersion", "Refraction", "Diffraction"], answer: "Refraction" }
      ]
    }
  }
  // --- CLASS 11 & 12 ---
  else if (title.includes("Sets") || title.includes("Relations and Functions")) {
    return {
      content: `A Set is a well-defined collection of distinct objects, considered as an object in its own right. Sets are conventionally denoted with capital letters.

A Relation is a subset of the Cartesian product of two sets. A Function is a special type of relation where every element of the domain (input) is uniquely mapped to exactly one element in the codomain (output). Functions are the fundamental building blocks of calculus and advanced mathematics.`,
      quiz: [
        { question: "What is a set?", options: ["Any group of numbers", "A well-defined collection of distinct objects", "A list of equations", "An unknown variable"], answer: "A well-defined collection of distinct objects" },
        { question: "In a function, can one input have multiple outputs?", options: ["Yes", "No", "Only in quadratic functions", "Only if the output is zero"], answer: "No" }
      ]
    }
  } else if (title.includes("Electric Charges") || title.includes("Units and Measurements")) {
    return {
      content: `Physics is a quantitative science, based on measurement of physical quantities. A physical quantity is a property of a material or system that can be quantified by measurement. The standard measure of each kind of physical quantity is the unit (e.g., Meter for length, Kilogram for mass).

Electric charge is a fundamental physical property of matter that causes it to experience a force when kept in an electric or magnetic field. There are two types of electric charges: positive and negative. Like charges repel, and unlike charges attract.`,
      quiz: [
        { question: "What is the SI unit of electric charge?", options: ["Volt", "Ampere", "Coulomb", "Ohm"], answer: "Coulomb" },
        { question: "What do like charges do?", options: ["Attract", "Repel", "Nothing", "Neutralize"], answer: "Repel" }
      ]
    }
  } else if (title.includes("Solid State") || title.includes("Basic Concepts of Chemistry")) {
    return {
      content: `Chemistry is the science of molecules and their transformations. The central concepts include atoms, molecules, moles, and stoichiometry. The mole is the SI unit for the amount of substance.

The Solid State is a state of matter characterized by structural rigidity and resistance to changes of shape or volume. Solids can be crystalline (highly ordered microscopic structure) or amorphous (non-crystalline). The atoms in a solid are tightly bound to each other in a regular geometric lattice.`,
      quiz: [
        { question: "What is the SI unit for the amount of substance?", options: ["Gram", "Liter", "Mole", "Particle"], answer: "Mole" },
        { question: "Which type of solid lacks a highly ordered microscopic structure?", options: ["Crystalline", "Amorphous", "Metallic", "Ionic"], answer: "Amorphous" }
      ]
    }
  } else if (title.includes("Living World") || title.includes("Reproduction")) {
    return {
      content: `Biology is the story of life on earth. The Living World encompasses diverse organisms. Key characteristics of life include growth, reproduction, ability to sense the environment and mount a suitable response, metabolism, and cellular organization.

Reproduction is a biological process by which an organism reproduces an offspring who is biologically similar to the organism. It enables and ensures the continuity of species, generation after generation. It can be asexual (single parent, no fusion of gametes) or sexual (two parents, fusion of gametes).`,
      quiz: [
        { question: "Which characteristic is NOT a defining property of all living organisms?", options: ["Metabolism", "Cellular organization", "Consciousness", "Ability to fly"], answer: "Ability to fly" },
        { question: "Reproduction involving only one parent without the fusion of gametes is called:", options: ["Sexual reproduction", "Asexual reproduction", "Fertilization", "Pollination"], answer: "Asexual reproduction" }
      ]
    }
  }

  data = specificData[title] || specificData[cleanTitle];
  
  if (data && data.lessons && data.lessons[lessonNum - 1]) {
    const lesson = data.lessons[lessonNum - 1];
    return {
      content: `
        <div class="lesson-header" style="margin-bottom: 2rem;">
          <h2 style="color: var(--accent-red); font-size: 1.8rem; margin-bottom: 1rem;">${lesson.title}</h2>
          <div style="background: rgba(255,255,255,0.03); border-left: 4px solid var(--accent-red); padding: 1.5rem; border-radius: 0 12px 12px 0; margin-bottom: 2rem;">
            <p style="font-size: 1.1rem; line-height: 1.6; color: var(--text-primary);">${lesson.explanation}</p>
          </div>
        </div>

        <div class="vocabulary-section" style="margin-bottom: 2.5rem;">
          <h3 style="font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem; display: flex; alignItems: center; gap: 0.5rem;">
            <span style="background: var(--accent-red); width: 8px; height: 24px; border-radius: 4px; display: inline-block;"></span>
            Key Vocabulary
          </h3>
          <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
            ${(lesson.words || []).map(word => `
              <span style="background: rgba(255,255,255,0.05); padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid var(--glass-border); font-size: 0.95rem; color: var(--text-secondary);">
                ${word}
              </span>
            `).join('')}
          </div>
        </div>

        ${lesson.activities ? `
        <div class="activities-section" style="margin-bottom: 2.5rem; padding: 1.5rem; background: rgba(255, 51, 68, 0.05); border-radius: 16px; border: 1px dashed var(--accent-red);">
          <h3 style="font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem; color: var(--accent-red);">🚀 Practice Activity</h3>
          <div style="color: var(--text-primary); line-height: 1.6;">${lesson.activities}</div>
        </div>
        ` : ''}

        <div class="chapter-context" style="opacity: 0.8; font-size: 0.95rem; border-top: 1px dashed var(--glass-border); pt: 1.5rem;">
          <p><strong>Chapter Context:</strong> This is lesson ${lessonNum} of the chapter "${title}".</p>
        </div>
      `,
      quiz: lessonNum === 6 ? (data.quiz || []) : [(data.quiz && data.quiz.length > 0) ? data.quiz[(lessonNum - 1) % data.quiz.length] : { question: "Knowledge Check", options: ["A", "B", "C", "D"], answer: "A" }],
      topics: (data.lessons || []).map(l => l.title)
    };
  }

  // Fallback for missing lesson data - Auto-slice content into 6 lessons
  if (data) {
    const content = data.content;
    let slicedContent = content;
    let topic = "General Learning";

    // Attempt to extract sections based on common headers
    const sections = {
      intro: content.match(/Main focus:.*?<\/h3>(.*?)<p><strong>Detailed explanation:<\/strong>/s)?.[1] || "Introduction to the chapter.",
      explanation: content.match(/Detailed explanation:<\/strong>(.*?)<h3><strong>/s)?.[1] || content.match(/Detailed explanation:<\/strong>(.*?)<\/p>/s)?.[1] || "Detailed study material.",
      grammar: content.match(/Grammar focus:.*?<\/h3>(.*?)<h3><strong>/s)?.[1] || content.match(/Grammar focus:.*?<\/h3>(.*?)<\/div>/s)?.[1] || "Key concepts and rules.",
      activities: content.match(/Activities:.*?<\/h3>(.*?)<\/div>/s)?.[1] || content.match(/Activities:.*?<\/h3>(.*?)<\/ul>/s)?.[0] || "Hands-on activities.",
      summary: "Reviewing the key points and preparing for the final assessment."
    };

    switch(lessonNum) {
      case 1: 
        topic = "Main Focus & Introduction";
        slicedContent = `<div style="padding: 1rem; background: rgba(255, 51, 68, 0.05); border-left: 4px solid var(--accent-red); margin-bottom: 2rem;">
                          <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${topic}</h2>
                          ${sections.intro}
                        </div>`;
        break;
      case 2:
        topic = "Concept Deep-Dive";
        slicedContent = `<div style="padding: 1rem; background: rgba(255, 255, 255, 0.02); border-left: 4px solid var(--accent-red); margin-bottom: 2rem;">
                          <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${topic}</h2>
                          <p style="font-size: 1.1rem; line-height: 1.8;">${sections.explanation}</p>
                        </div>`;
        break;
      case 3:
        topic = "Key Concepts & Rules";
        slicedContent = `<div style="padding: 1rem; background: rgba(255, 255, 255, 0.02); border-left: 4px solid var(--accent-red); margin-bottom: 2rem;">
                          <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${topic}</h2>
                          ${sections.grammar}
                        </div>`;
        break;
      case 4:
        topic = "Learning Activities";
        slicedContent = `<div style="padding: 1rem; background: rgba(255, 255, 255, 0.02); border-left: 4px solid var(--accent-red); margin-bottom: 2rem;">
                          <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${topic}</h2>
                          ${sections.activities}
                        </div>`;
        break;
      case 5:
        topic = "Mission Practice";
        slicedContent = `<div style="padding: 1rem; background: rgba(255, 255, 255, 0.02); border-left: 4px solid var(--accent-red); margin-bottom: 2rem;">
                          <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${topic}</h2>
                          <p>${sections.summary}</p>
                          <div style="margin-top: 2rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed var(--glass-border);">
                            <p><strong>Practice Mission:</strong> Re-read the sections above and answer the quick check below!</p>
                          </div>
                        </div>`;
        break;
      case 6:
        topic = "Chapter Final Assessment";
        slicedContent = `<div style="padding: 1rem; background: rgba(255, 51, 68, 0.1); border-radius: 16px; margin-bottom: 2rem; text-align: center;">
                          <h2 style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--accent-red);">🏆 Final Challenge</h2>
                          <p>You have reached the end of this chapter. Complete the full assessment below to master this mission!</p>
                        </div>`;
        break;
    }

    return {
      content: slicedContent,
      quiz: lessonNum === 6 ? (data.quiz || []) : [(data.quiz && data.quiz.length > 0) ? data.quiz[(lessonNum - 1) % data.quiz.length] : { question: "Knowledge Check", options: ["A", "B", "C", "D"], answer: "A" }],
      topics: ["Introduction", "Concept Deep-Dive", "Key Concepts", "Activities", "Practice", "Final Assessment"]
    };
  }

  // --- ELEMENTARY FALLBACKS ---
  if (title.includes("Addition") || title.includes("Subtraction") || title.includes("Numbers") || title.includes("Math") || title.includes("Shapes")) {
    return {
      content: `<h3><strong>Lesson ${lessonNum}</strong></h3>
                <p>Mathematics starts with numbers and counting. Addition is the process of combining two or more groups of objects into a single larger group. Subtraction is the process of taking away objects from a group.</p>`,
      quiz: [
        { question: "What is 15 + 8?", options: ["21", "22", "23", "24"], answer: "23" }
      ],
      topics: ["Introduction", "Concepts", "Practice"]
    }
  }

  // Check if we have specific data
  data = specificData[cleanTitle];
  
  if (data) {
    // Ensure exactly 5 questions if possible
    if (data.quiz) {
      if (data.quiz.length > 5) {
        data.quiz = data.quiz.slice(0, 5);
      } else if (data.quiz.length < 5) {
        const extraQuestions = [
          { "question": `What is the most interesting part of ${cleanTitle}?`, "options": ["The beginning", "The middle", "The end", "The whole thing"], "answer": "The whole thing" },
          { "question": `Which tool helps us learn ${cleanTitle} better?`, "options": ["Focus", "Interest", "Food", "Sleep"], "answer": "Focus" },
          { "question": `How do you feel about ${cleanTitle} after this?`, "options": ["Confused", "Confident", "Bored", "Tired"], "answer": "Confident" },
          { "question": `Who can help you if you have questions about ${cleanTitle}?`, "options": ["A teacher", "A cat", "A pillow", "The floor"], "answer": "A teacher" },
          { "question": `Is ${cleanTitle} a fun topic?`, "options": ["Yes!", "No", "Maybe", "I don't know"], "answer": "Yes!" }
        ];
        while (data.quiz.length < 5) {
          data.quiz.push(extraQuestions[data.quiz.length % extraQuestions.length]);
        }
      }
    }
    return data;
  }

  // Fallback for missing content (ensures every lesson in Class 1-12 works)
  const defaultQuiz = [
    { "question": `What is the main idea of ${cleanTitle}?`, "options": ["Important detail", "Random fact", "Simple idea", "Advanced logic"], "answer": "Simple idea" },
    { "question": `Which subject does ${cleanTitle} belong to?`, "options": ["Math", "Science", "History", subject], "answer": subject },
    { "question": `Why is ${cleanTitle} important to learn?`, "options": ["To pass exams", "To build knowledge", "To play games", "To sleep better"], "answer": "To build knowledge" },
    { "question": `Is ${cleanTitle} part of the Class ${lessonNum} syllabus?`, "options": ["Yes", "No", "Maybe", "Not sure"], "answer": "Yes" },
    { "question": `What should we do after studying ${cleanTitle}?`, "options": ["Forget it", "Practice and review", "Watch TV", "Jump around"], "answer": "Practice and review" }
  ];

  return {
    content: `<h3><strong>Deep Dive into ${cleanTitle}</strong></h3>\
<p>Welcome to your lesson on <strong>${cleanTitle}</strong>! This topic is a core part of the Class ${lessonNum} curriculum. In this lesson, we explore the fundamental principles of ${subject} as they relate to ${cleanTitle}. By understanding these concepts, you will build a strong foundation for future learning.</p>\
<h4><strong>Key Learning Objectives:</strong></h4>\
<ul>\
<li>Identify the main characteristics of ${cleanTitle}.</li>\
<li>Explain how ${cleanTitle} works in daily life.</li>\
<li>Practice applying your knowledge through interactive exercises.</li>\
</ul>\
<p>Stay focused and curious as you move through the material. Learning is an adventure that starts with a single step!</p>`,
    quiz: defaultQuiz,
    lessons: [
      { title: `Introduction to ${cleanTitle}`, explanation: `In this section, we define what ${cleanTitle} is and why it matters in ${subject}.`, words: [cleanTitle, subject, "Foundation"], activities: `Think of one example of ${cleanTitle} you have seen today.` },
      { title: `Core Principles`, explanation: `We look at the basic rules and ideas that make ${cleanTitle} special.`, words: ["Principles", "Logic", "Structure"], activities: `Write down two things you've learned about ${cleanTitle} so far.` },
      { title: `Real-World Examples`, explanation: `Where do we see ${cleanTitle} outside of the classroom?`, words: ["Application", "Reality", "Context"], activities: `Ask a family member if they know anything about ${cleanTitle}.` },
      { title: `Practice Session`, explanation: `Time to test your knowledge!`, words: ["Practice", "Skill", "Accuracy"], activities: `Try to explain ${cleanTitle} to a friend.` },
      { title: `Summary & Review`, explanation: `We wrap up everything we've learned today.`, words: ["Summary", "Review", "Memory"], activities: `Close your eyes and remember the 3 most important parts.` }
    ]
  };
};
