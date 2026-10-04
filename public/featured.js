// Κορυφαία γεγονότα με πλούσιο περιεχόμενο: βίντεο (Wikimedia Commons), φωτογραφίες-καρτ ποστάλ και μίνι ιστορίες (tours).
// kind: "video" | "model" | "tour". Κείμενα: el / en.
// Άδειες: κάθε βίντεο/μοντέλο έχει credit και σύνδεσμο στην πηγή· εμφανίζονται μέσα στο popup.
(function () {
  const COMMONS = "https://upload.wikimedia.org/wikipedia/commons/";
  window.WORLD_FEATURED = {
    // ---------------- ΒΙΝΤΕΟ ----------------
    moon: {
      kind: "video",
      sources: [
        { src: COMMONS + "transcoded/a/a6/Apollo_11_Landing_-_first_steps_on_the_moon.ogv/Apollo_11_Landing_-_first_steps_on_the_moon.ogv.240p.vp9.webm", type: "video/webm" },
        { src: COMMONS + "transcoded/a/a6/Apollo_11_Landing_-_first_steps_on_the_moon.ogv/Apollo_11_Landing_-_first_steps_on_the_moon.ogv.360p.mpeg4.mov", type: "video/mp4" },
        { src: COMMONS + "a/a6/Apollo_11_Landing_-_first_steps_on_the_moon.ogv", type: "video/ogg" },
      ],
      page: "https://commons.wikimedia.org/wiki/File:Apollo_11_Landing_-_first_steps_on_the_moon.ogv",
      credit: "NASA · Public domain",
      caption: { el: "Τα πρώτα βήματα του Νιλ Άρμστρονγκ στη Σελήνη, 20 Ιουλίου 1969 (αρχείο NASA).", en: "Neil Armstrong's first steps on the Moon, 20 July 1969 (NASA footage)." },
    },
    wallfall: {
      kind: "video",
      sources: [
        { src: COMMONS + "transcoded/f/fe/Grenz%C3%B6ffnung_November_1989_-_Selmsdorf_%28DDR%29_-_L%C3%BCbeck-Schlutup.webm/Grenz%C3%B6ffnung_November_1989_-_Selmsdorf_%28DDR%29_-_L%C3%BCbeck-Schlutup.webm.480p.vp9.webm", type: "video/webm" },
        { src: COMMONS + "transcoded/f/fe/Grenz%C3%B6ffnung_November_1989_-_Selmsdorf_%28DDR%29_-_L%C3%BCbeck-Schlutup.webm/Grenz%C3%B6ffnung_November_1989_-_Selmsdorf_%28DDR%29_-_L%C3%BCbeck-Schlutup.webm.360p.mpeg4.mov", type: "video/mp4" },
      ],
      page: "https://commons.wikimedia.org/wiki/File:Grenz%C3%B6ffnung_November_1989_-_Selmsdorf_(DDR)_-_L%C3%BCbeck-Schlutup.webm",
      credit: "Manfred Krellenberg · CC BY 3.0",
      caption: { el: "Νοέμβριος 1989: τα σύνορα της Ανατολικής Γερμανίας ανοίγουν. Αυθεντικό ερασιτεχνικό φιλμ από το πέρασμα Σέλμσντορφ–Λίμπεκ, λίγες μέρες μετά την πτώση του Τείχους.", en: "November 1989: East Germany's border opens. Authentic amateur footage from the Selmsdorf–Lübeck crossing, days after the Wall fell." },
    },
    chernobyl: {
      kind: "video",
      sources: [
        { src: COMMONS + "transcoded/b/b0/The_%22hottest%22_spot_in_the_Unit_4_control_room_at_Chernobyl.webm/The_%22hottest%22_spot_in_the_Unit_4_control_room_at_Chernobyl.webm.480p.vp9.webm", type: "video/webm" },
        { src: COMMONS + "transcoded/b/b0/The_%22hottest%22_spot_in_the_Unit_4_control_room_at_Chernobyl.webm/The_%22hottest%22_spot_in_the_Unit_4_control_room_at_Chernobyl.webm.360p.mpeg4.mov", type: "video/mp4" },
      ],
      page: "https://commons.wikimedia.org/wiki/File:The_%22hottest%22_spot_in_the_Unit_4_control_room_at_Chernobyl.webm",
      credit: "Carl Willis · CC BY 3.0",
      caption: { el: "Μέσα στην αίθουσα ελέγχου του Αντιδραστήρα 4, εκεί όπου ξεκίνησε η καταστροφή. Ο μετρητής ακτινοβολίας δείχνει το «θερμότερο» σημείο.", en: "Inside the control room of Reactor 4, where the disaster began. The dosimeter finds the 'hottest' spot." },
    },

    // ---------------- ΦΩΤΟΓΡΑΦΙΕΣ: η εικόνα της Wikipedia εμφανίζεται σαν καρτ ποστάλ πάνω στον χάρτη ----------------
    giza: {
      kind: "photo",
      caption: { el: "146 μέτρα ύψος, 2,3 εκατ. ογκόλιθοι, 20 χρόνια κατασκευής. Για 3.800 χρόνια το ψηλότερο κτίσμα του κόσμου.", en: "146 metres tall, 2.3 million blocks, 20 years to build. For 3,800 years the tallest structure on Earth." },
    },
    parthenon: {
      kind: "photo",
      caption: { el: "Ικτίνος, Καλλικράτης, Φειδίας, 447–432 π.Χ. Κάθε κολόνα γέρνει ελάχιστα προς τα μέσα· καμία γραμμή του δεν είναι απολύτως ευθεία.", en: "Ictinus, Callicrates, Phidias, 447–432 BC. Every column leans slightly inward; not one of its lines is perfectly straight." },
    },
    einstein: {
      kind: "photo",
      caption: { el: "Το 1905, ένας 26χρονος υπάλληλος γραφείου ευρεσιτεχνιών στη Βέρνη αλλάζει τη φυσική: χρόνος, χώρος, μάζα και ενέργεια δεν θα είναι ποτέ ξανά τα ίδια.", en: "In 1905 a 26-year-old patent clerk in Bern changes physics: time, space, mass and energy will never be the same." },
    },
    titanic: {
      kind: "photo",
      caption: { el: "269 μέτρα, το μεγαλύτερο πλοίο του κόσμου, «αβύθιστο». Χτύπησε το παγόβουνο στις 23:40 και βυθίστηκε σε 2 ώρες και 40 λεπτά.", en: "269 metres, the largest ship in the world, 'unsinkable'. It struck the iceberg at 23:40 and sank in 2 hours 40 minutes." },
    },

    // ---------------- ΜΙΝΙ ΙΣΤΟΡΙΕΣ (tours) ----------------
    alexander: {
      kind: "tour", color: "#ffd36b",
      stops: [
        { lat: 40.0, lng: 27.3, k: 4, date: "-334-05", el: ["Γρανικός, Μάιος 334 π.Χ.", "Ο 22χρονος Αλέξανδρος περνά τον Ελλήσποντο με 40.000 άνδρες και νικά τους σατράπες στον ποταμό Γρανικό. Ο δρόμος για τη Μικρά Ασία ανοίγει."], en: ["Granicus, May 334 BC", "Alexander, aged 22, crosses the Hellespont with 40,000 men and defeats the satraps at the river Granicus. The road into Asia Minor is open."] },
        { lat: 36.8, lng: 36.2, k: 4, date: "-333-11", el: ["Ισσός, Νοέμβριος 333 π.Χ.", "Πρώτη σύγκρουση με τον ίδιο τον Δαρείο Γ΄. Ο Μέγας Βασιλεύς τρέπεται σε φυγή αφήνοντας πίσω τη μητέρα, τη σύζυγο και τις κόρες του."], en: ["Issus, November 333 BC", "First clash with Darius III himself. The Great King flees, abandoning his mother, wife and daughters."] },
        { lat: 31.2, lng: 29.92, k: 3.5, date: "-331-04", el: ["Αίγυπτος, 332–331 π.Χ.", "Μετά από επτάμηνη πολιορκία πέφτει η Τύρος. Στην Αίγυπτο οι ιερείς τον στέφουν Φαραώ και ιδρύει την Αλεξάνδρεια, τη μελλοντική πρωτεύουσα της γνώσης."], en: ["Egypt, 332–331 BC", "Tyre falls after a seven-month siege. In Egypt the priests crown him Pharaoh and he founds Alexandria, the future capital of knowledge."] },
        { lat: 36.56, lng: 43.4, k: 4, date: "-331-10", el: ["Γαυγάμηλα, 1 Οκτωβρίου 331 π.Χ.", "Η αποφασιστική μάχη. Ο Δαρείος φεύγει ξανά· Βαβυλώνα και Σούσα παραδίδονται. Το 330 π.Χ. η Περσέπολη καίγεται."], en: ["Gaugamela, 1 October 331 BC", "The decisive battle. Darius flees again; Babylon and Susa surrender. In 330 BC Persepolis burns."] },
        { lat: 39.65, lng: 66.97, k: 3.5, date: "-329", el: ["Σαμαρκάνδη, 329 π.Χ.", "Τρία χρόνια σκληρού πολέμου στη Βακτρία και τη Σογδιανή. Ο Αλέξανδρος παντρεύεται τη Ρωξάνη και ιδρύει την Αλεξάνδρεια Εσχάτη, στα όρια του γνωστού κόσμου."], en: ["Samarkand, 329 BC", "Three years of hard fighting in Bactria and Sogdiana. Alexander marries Roxana and founds Alexandria Eschate, at the edge of the known world."] },
        { lat: 32.5, lng: 73.5, k: 4, date: "-326-05", el: ["Υδάσπης, Μάιος 326 π.Χ.", "Νίκη επί του Πώρου και των 200 ελεφάντων του. Στον Ύφαση ο στρατός αρνείται να προχωρήσει· ο Αλέξανδρος γυρίζει πίσω μέσα από την έρημο της Γεδρωσίας."], en: ["Hydaspes, May 326 BC", "Victory over Porus and his 200 elephants. At the Hyphasis the army refuses to go further; Alexander turns back through the Gedrosian desert."] },
        { lat: 32.54, lng: 44.42, k: 4, date: "-323-06", el: ["Βαβυλώνα, 10 Ιουνίου 323 π.Χ.", "Πεθαίνει στα 32 του, στο παλάτι του Ναβουχοδονόσορα, χωρίς διάδοχο. Οι στρατηγοί του μοιράζουν την αυτοκρατορία και αρχίζει η ελληνιστική εποχή."], en: ["Babylon, 10 June 323 BC", "He dies at 32, in Nebuchadnezzar's palace, without an heir. His generals divide the empire and the Hellenistic age begins."] },
      ],
    },
    blackdeath: {
      kind: "tour", color: "#b36bff",
      stops: [
        { lat: 45.03, lng: 35.38, k: 4, date: "1346", el: ["Κάφα, Κριμαία, 1346", "Οι Μογγόλοι πολιορκούν τη γενουατική Κάφα. Η πανώλη, που έρχεται από την Ασία μέσω του Δρόμου του Μεταξιού, ξεσπά στο στρατόπεδό τους· κατά τον θρύλο εκσφενδονίζουν τα πτώματα μέσα στην πόλη."], en: ["Caffa, Crimea, 1346", "The Mongols besiege Genoese Caffa. The plague, arriving from Asia along the Silk Road, breaks out in their camp; legend says they catapult corpses into the city."] },
        { lat: 38.19, lng: 15.55, k: 4, date: "1347-10", photo: "Plague doctor costume", el: ["Μεσσήνη, Οκτώβριος 1347", "Δώδεκα γενουατικές γαλέρες φτάνουν στη Σικελία με ετοιμοθάνατα πληρώματα. Η πόλη τις διώχνει, αλλά είναι αργά: η πανώλη έχει πατήσει στην Ευρώπη."], en: ["Messina, October 1347", "Twelve Genoese galleys reach Sicily with dying crews. The city expels them, but too late: the plague has landed in Europe."] },
        { lat: 43.3, lng: 5.37, k: 3.5, date: "1348-01", el: ["Μασσαλία, Γένοβα, Βενετία, χειμώνας 1348", "Τα λιμάνια της Μεσογείου πέφτουν το ένα μετά το άλλο. Η Βενετία επινοεί την «καραντίνα»: σαράντα ημέρες απομόνωσης για τα πλοία."], en: ["Marseille, Genoa, Venice, winter 1348", "The Mediterranean ports fall one after another. Venice invents 'quarantine': forty days of isolation for ships."] },
        { lat: 48.86, lng: 2.35, k: 3.5, date: "1348-08", photo: "Plague doctor costume", el: ["Παρίσι και Λονδίνο, 1348", "Το καλοκαίρι φτάνει στο Παρίσι, όπου πεθαίνουν 800 την ημέρα, και τον Νοέμβριο στο Λονδίνο. Οι γιατροί συνιστούν αρώματα και αφαιμάξεις· τίποτα δεν βοηθά."], en: ["Paris and London, 1348", "In summer it reaches Paris, where 800 die a day, and in November London. Doctors prescribe perfumes and bloodletting; nothing helps."] },
        { lat: 52.5, lng: 13.4, k: 3, date: "1349-06", el: ["Γερμανία και Σκανδιναβία, 1349–1350", "Οι Φλαγγελάντες περιοδεύουν αυτομαστιγούμενοι. Εκατοντάδες εβραϊκές κοινότητες σφαγιάζονται ως «ένοχες». Ένα πλοίο-φάντασμα φέρνει την αρρώστια στο Μπέργκεν της Νορβηγίας."], en: ["Germany and Scandinavia, 1349–1350", "Flagellants roam the land whipping themselves. Hundreds of Jewish communities are massacred as 'guilty'. A ghost ship brings the disease to Bergen, Norway."] },
        { lat: 55.75, lng: 37.6, k: 3, date: "1351", el: ["Μόσχα, 1351–1353", "Η πανώλη κλείνει τον κύκλο της στη Ρωσία. Σε πέντε χρόνια έχει πεθάνει το ένα τρίτο της Ευρώπης, ίσως 25 εκατ. άνθρωποι. Οι μισθοί ανεβαίνουν, η δουλοπαροικία κλονίζεται, ο κόσμος αλλάζει."], en: ["Moscow, 1351–1353", "The plague closes its circle in Russia. In five years a third of Europe has died, perhaps 25 million people. Wages rise, serfdom is shaken, the world changes."] },
      ],
    },
    magellan: {
      kind: "tour", color: "#5ec8ff",
      stops: [
        { lat: 36.78, lng: -6.35, k: 4, date: "1519-09-20", el: ["Σανλούκαρ, 20 Σεπτεμβρίου 1519", "Πέντε πλοία και 270 άνδρες αποπλέουν για να βρουν δυτικό δρόμο προς τα νησιά των μπαχαρικών. Ο Πορτογάλος Μαγγελάνος πλέει για λογαριασμό της Ισπανίας."], en: ["Sanlúcar, 20 September 1519", "Five ships and 270 men set sail to find a western route to the Spice Islands. The Portuguese Magellan sails for Spain."] },
        { lat: -49.3, lng: -67.7, k: 3.5, date: "1520-04", el: ["Πουέρτο Σαν Χουλιάν, Απρίλιος 1520", "Ξεχειμωνιάζοντας στην Παταγονία, τρεις καπετάνιοι στασιάζουν. Ο Μαγγελάνος εκτελεί τον έναν και εγκαταλείπει άλλον στην ακτή. Το Santiago ναυαγεί."], en: ["Puerto San Julián, April 1520", "Wintering in Patagonia, three captains mutiny. Magellan executes one and maroons another. The Santiago is wrecked."] },
        { lat: -53.5, lng: -70.9, k: 4, date: "1520-11", el: ["Το Στενό, Νοέμβριος 1520", "Τριάντα οκτώ ημέρες μέσα σε λαβύρινθο από φιόρδ. Το San Antonio λιποτακτεί και γυρίζει στην Ισπανία. Τα τρία πλοία βγαίνουν σε έναν ήρεμο ωκεανό που ο Μαγγελάνος ονομάζει «Ειρηνικό»."], en: ["The Strait, November 1520", "Thirty-eight days through a labyrinth of fjords. The San Antonio deserts and returns to Spain. Three ships emerge into a calm ocean Magellan names the 'Pacific'."] },
        { lat: 13.45, lng: 144.75, k: 3, date: "1521-03-06", el: ["Γκουάμ, 6 Μαρτίου 1521", "99 ημέρες χωρίς στεριά. Το πλήρωμα τρώει δέρμα, πριονίδι και αρουραίους· το σκορβούτο σκοτώνει 19 άνδρες. Κανείς δεν είχε φανταστεί πόσο μεγάλος είναι ο Ειρηνικός."], en: ["Guam, 6 March 1521", "99 days without land. The crew eat leather, sawdust and rats; scurvy kills 19 men. No one had imagined how vast the Pacific is."] },
        { lat: 10.3, lng: 124.0, k: 4.5, date: "1521-04-27", el: ["Μακτάν, 27 Απριλίου 1521", "Στις Φιλιππίνες ο Μαγγελάνος μπλέκει σε τοπικό πόλεμο. Στην παραλία του Μακτάν ο αρχηγός Λαπουλάπου και οι άνδρες του τον σκοτώνουν. Ο Πιγκαφέτα, ο χρονικογράφος, επιζεί."], en: ["Mactan, 27 April 1521", "In the Philippines Magellan gets drawn into a local war. On the beach of Mactan chief Lapulapu and his men kill him. Pigafetta, the chronicler, survives."] },
        { lat: 0.68, lng: 127.4, k: 4, date: "1521-11-08", el: ["Τιντόρε, Μολούκες, 8 Νοεμβρίου 1521", "Τα δύο εναπομείναντα πλοία φτάνουν τελικά στα νησιά των μπαχαρικών και φορτώνουν γαρίφαλο. Το Trinidad δεν θα γυρίσει ποτέ."], en: ["Tidore, Moluccas, 8 November 1521", "The two remaining ships finally reach the Spice Islands and load cloves. The Trinidad will never return."] },
        { lat: 36.78, lng: -6.35, k: 4, date: "1522-09-06", el: ["Σανλούκαρ, 6 Σεπτεμβρίου 1522", "Το Victoria, με καπετάνιο τον Ελκάνο και 18 εξαντλημένους άνδρες, ολοκληρώνει τον πρώτο περίπλου της Γης μετά από 3 χρόνια. Το φορτίο γαρίφαλου πληρώνει όλη την αποστολή."], en: ["Sanlúcar, 6 September 1522", "The Victoria, captained by Elcano with 18 exhausted men, completes the first circumnavigation of the Earth after three years. The cargo of cloves pays for the whole expedition."] },
      ],
    },

    // ======================= ΔΕΥΤΕΡΗ ΟΜΑΔΑ =======================
    // ---- βίντεο ----
    hiroshima: {
      kind: "video",
      sources: [
        { src: COMMONS + "transcoded/0/04/Tale_of_Two_Cities_%281946%29.webm/Tale_of_Two_Cities_%281946%29.webm.480p.vp9.webm", type: "video/webm" },
        { src: COMMONS + "transcoded/0/04/Tale_of_Two_Cities_%281946%29.webm/Tale_of_Two_Cities_%281946%29.webm.360p.mpeg4.mov", type: "video/mp4" },
      ],
      page: "https://commons.wikimedia.org/wiki/File:Tale_of_Two_Cities_(1946).webm",
      credit: "U.S. War Department, 1946 · Public domain",
      caption: { el: "«A Tale of Two Cities» (1946): το επίσημο αμερικανικό φιλμ για τη Χιροσίμα και το Ναγκασάκι, γυρισμένο λίγους μήνες μετά τις βόμβες.", en: "'A Tale of Two Cities' (1946): the official US film on Hiroshima and Nagasaki, shot months after the bombs." },
    },
    dday: {
      kind: "video",
      sources: [
        { src: COMMONS + "transcoded/1/12/D-Day_1944_Office_of_War_Information.webm/D-Day_1944_Office_of_War_Information.webm.480p.vp9.webm", type: "video/webm" },
        { src: COMMONS + "transcoded/1/12/D-Day_1944_Office_of_War_Information.webm/D-Day_1944_Office_of_War_Information.webm.360p.mpeg4.mov", type: "video/mp4" },
      ],
      page: "https://commons.wikimedia.org/wiki/File:D-Day_1944_Office_of_War_Information.webm",
      credit: "US National Archives · Public domain",
      caption: { el: "6 Ιουνίου 1944: τα επίκαιρα της απόβασης στη Νορμανδία από το Office of War Information.", en: "6 June 1944: the Normandy landings in the Office of War Information newsreel." },
    },
    sf1906: {
      kind: "video",
      sources: [
        { src: COMMONS + "transcoded/e/e7/San_Francisco_earthquake_and_fire%2C_April_18%2C_1906.webm/San_Francisco_earthquake_and_fire%2C_April_18%2C_1906.webm.480p.vp9.webm", type: "video/webm" },
        { src: COMMONS + "transcoded/e/e7/San_Francisco_earthquake_and_fire%2C_April_18%2C_1906.webm/San_Francisco_earthquake_and_fire%2C_April_18%2C_1906.webm.360p.mpeg4.mov", type: "video/mp4" },
      ],
      page: "https://commons.wikimedia.org/wiki/File:San_Francisco_earthquake_and_fire,_April_18,_1906.webm",
      credit: "Library of Congress · Public domain",
      caption: { el: "Το Σαν Φρανσίσκο στις φλόγες, 18 Απριλίου 1906. Από τα πρώτα φιλμ καταστροφής στην ιστορία.", en: "San Francisco in flames, 18 April 1906. One of the first disaster films in history." },
    },
    wright: {
      kind: "video",
      sources: [
        { src: COMMONS + "transcoded/a/a8/First_flights_in_aviation_history.ogv/First_flights_in_aviation_history.ogv.240p.vp9.webm", type: "video/webm" },
        { src: COMMONS + "transcoded/a/a8/First_flights_in_aviation_history.ogv/First_flights_in_aviation_history.ogv.360p.mpeg4.mov", type: "video/mp4" },
      ],
      page: "https://commons.wikimedia.org/wiki/File:First_flights_in_aviation_history.ogv",
      credit: "Public domain",
      caption: { el: "Οι πρώτες πτήσεις της ιστορίας: οι αδελφοί Ράιτ και οι πρώτοι αεροπόροι, 1903–1910.", en: "The first flights in history: the Wright brothers and the first aviators, 1903–1910." },
    },
    sputnik: {
      kind: "video",
      sources: [
        { src: COMMONS + "transcoded/6/62/1957-10-07_New_Moon.ogv/1957-10-07_New_Moon.ogv.480p.vp9.webm", type: "video/webm" },
        { src: COMMONS + "transcoded/6/62/1957-10-07_New_Moon.ogv/1957-10-07_New_Moon.ogv.360p.mpeg4.mov", type: "video/mp4" },
      ],
      page: "https://commons.wikimedia.org/wiki/File:1957-10-07_New_Moon.ogv",
      credit: "Universal Newsreel · Public domain",
      caption: { el: "«Νέα Σελήνη»: τα αμερικανικά επίκαιρα της 7ης Οκτωβρίου 1957 για τον σοβιετικό Σπούτνικ. Αρχή της διαστημικής κούρσας.", en: "'New Moon': the US newsreel of 7 October 1957 on the Soviet Sputnik. The space race begins." },
    },
    // ---- φωτογραφίες (καρτ ποστάλ πάνω στον χάρτη) ----
    stonehenge: { kind: "photo", caption: { el: "Οι μεγάλοι ορθόλιθοι ζυγίζουν ως 25 τόνους· οι μπλε πέτρες ήρθαν από την Ουαλία, 250 χλμ. μακριά. Στοιχίζεται με την ανατολή του ηλίου το θερινό ηλιοστάσιο.", en: "The great sarsens weigh up to 25 tonnes; the bluestones came from Wales, 250 km away. It aligns with sunrise at the summer solstice." } },
    greatwall: { kind: "photo", caption: { el: "Όλα τα τμήματα μαζί ξεπερνούν τα 21.000 χλμ. Οι πύργοι επικοινωνούσαν με καπνό τη μέρα και φωτιά τη νύχτα.", en: "All the sections together exceed 21,000 km. The towers signalled with smoke by day and fire by night." } },
    troy: { kind: "photo", caption: { el: "Μετά από δέκα χρόνια πολιορκίας, οι Έλληνες «φεύγουν» αφήνοντας δώρο ένα ξύλινο άλογο. Τη νύχτα, οι πολεμιστές που κρύβονται μέσα ανοίγουν τις πύλες.", en: "After ten years of siege the Greeks 'leave' behind a wooden horse as a gift. At night the warriors hidden inside open the gates." } },
    rapanui: { kind: "photo", caption: { el: "Περίπου 900 αγάλματα, σκαλισμένα στο ηφαιστειακό λατομείο Ράνο Ραράκου και μεταφερμένα χιλιόμετρα μακριά· κατά την παράδοση «περπάτησαν».", en: "About 900 statues, carved in the volcanic quarry of Rano Raraku and moved kilometres away; tradition says they 'walked'." } },
    terracotta: { kind: "photo", caption: { el: "Κάθε στρατιώτης έχει διαφορετικό πρόσωπο. Θάφτηκαν το 210 π.Χ. για να φυλάνε τον πρώτο αυτοκράτορα και βρέθηκαν τυχαία το 1974 από αγρότες που έσκαβαν πηγάδι.", en: "Every soldier has a different face. Buried in 210 BC to guard the first emperor, they were found by chance in 1974 by farmers digging a well." } },
    vesuvius: { kind: "photo", caption: { el: "24 Αυγούστου 79 μ.Χ.: η Πομπηία και το Ηρακλήσιο θάβονται κάτω από 6 μέτρα τέφρας μέσα σε μία μέρα. Οι πόλεις θα μείνουν σφραγισμένες για 1.700 χρόνια.", en: "24 August AD 79: Pompeii and Herculaneum are buried under 6 metres of ash in a single day. The cities stay sealed for 1,700 years." } },
    krakatoa: { kind: "photo", caption: { el: "27 Αυγούστου 1883: η έκρηξη ακούστηκε 4.800 χλμ. μακριά, το τσουνάμι σκότωσε 36.000 ανθρώπους και η τέφρα έβαψε τα ηλιοβασιλέματα όλου του κόσμου για χρόνια.", en: "27 August 1883: the explosion was heard 4,800 km away, the tsunami killed 36,000 people and the ash coloured sunsets worldwide for years." } },
    eiffel: { kind: "photo", caption: { el: "Χτίστηκε σε 2 χρόνια για την Έκθεση του 1889 και επρόκειτο να γκρεμιστεί το 1909. Για 41 χρόνια ήταν η ψηλότερη κατασκευή του κόσμου.", en: "Built in 2 years for the 1889 Exposition and due to be dismantled in 1909. For 41 years the tallest structure in the world." } },
    gutenberg: { kind: "photo", caption: { el: "Κινητά μεταλλικά στοιχεία, λαδομπογιά και ένα πιεστήριο κρασιού: 180 Βίβλοι σε 3 χρόνια, όσες θα αντέγραφε ένας μοναχός σε 3 αιώνες.", en: "Movable metal type, oil-based ink and a wine press: 180 Bibles in 3 years, as many as one monk would copy in 3 centuries." } },
    // ---- μίνι ιστορίες ----
    columbus: {
      kind: "tour", color: "#ffd36b",
      stops: [
        { lat: 37.23, lng: -6.9, k: 4, date: "1492-08-03", el: ["Πάλος, 3 Αυγούστου 1492", "Τρία πλοία και 90 άνδρες. Ο Κολόμβος πιστεύει ότι η Ασία είναι 4.000 χλμ. δυτικά· στην πραγματικότητα είναι 20.000. Οι βασιλείς της Ισπανίας του έδωσαν την ευκαιρία μετά από 7 χρόνια αρνήσεων."], en: ["Palos, 3 August 1492", "Three ships and 90 men. Columbus believes Asia lies 4,000 km to the west; in reality it is 20,000. Spain's monarchs gave him his chance after 7 years of refusals."] },
        { lat: 28.1, lng: -17.1, k: 4, date: "1492-09-06", el: ["Κανάρια Νησιά, 6 Σεπτεμβρίου", "Επισκευές στη Λα Γκομέρα και αναχώρηση στο άγνωστο. Οι εμπορικοί άνεμοι τον σπρώχνουν δυτικά· κανένα πλοίο δεν είχε ξανακάνει αυτόν τον δρόμο."], en: ["Canary Islands, 6 September", "Repairs at La Gomera and departure into the unknown. The trade winds push him west; no ship had ever taken this route."] },
        { lat: 28.0, lng: -45.0, k: 3, date: "1492-10-10", el: ["Μέσα στον Ατλαντικό, 10 Οκτωβρίου", "Πέντε εβδομάδες χωρίς στεριά. Το πλήρωμα απειλεί με ανταρσία· ο Κολόμβος κρατά δύο ημερολόγια, ένα με ψεύτικες μικρότερες αποστάσεις για να μη φοβούνται."], en: ["Mid-Atlantic, 10 October", "Five weeks without land. The crew threatens mutiny; Columbus keeps two logs, one with falsely short distances so the men will not panic."] },
        { lat: 24.0, lng: -74.5, k: 4, date: "1492-10-12", el: ["Γκουαναχανί, 12 Οκτωβρίου 1492", "Στις 2 το πρωί ο ναύτης Ροδρίγο φωνάζει «Γη!». Ο Κολόμβος αποβιβάζεται σε ένα νησί των Μπαχάμες, το ονομάζει Σαν Σαλβαδόρ και πιστεύει ότι βρίσκεται κοντά στην Ιαπωνία."], en: ["Guanahani, 12 October 1492", "At 2 a.m. the sailor Rodrigo shouts 'Land!'. Columbus lands on a Bahamian island, names it San Salvador and believes he is near Japan."] },
        { lat: 19.7, lng: -72.2, k: 4, date: "1492-12-25", el: ["Ισπανιόλα, Χριστούγεννα 1492", "Η Santa María προσαράζει και χάνεται. Με τα ξύλα της χτίζεται το πρώτο οχυρό, η Λα Ναβιδάδ, όπου μένουν 39 άνδρες. Οι Ταΐνο τους υποδέχονται με χρυσό."], en: ["Hispaniola, Christmas 1492", "The Santa María runs aground and is lost. Its timbers build the first fort, La Navidad, where 39 men stay. The Taíno welcome them with gold."] },
        { lat: 37.23, lng: -6.9, k: 4, date: "1493-03-15", el: ["Πάλος, 15 Μαρτίου 1493", "Επιστροφή με χρυσό, παπαγάλους και έξι αιχμάλωτους Ταΐνο. Η Ευρώπη μαθαίνει για έναν «Νέο Κόσμο». Σε 50 χρόνια οι Ταΐνο θα έχουν σχεδόν αφανιστεί."], en: ["Palos, 15 March 1493", "He returns with gold, parrots and six captive Taíno. Europe learns of a 'New World'. Within 50 years the Taíno will be almost extinct."] },
      ],
    },
    genghis: {
      kind: "tour", color: "#ff8c5a",
      stops: [
        { lat: 48.5, lng: 110.0, k: 3, date: "1206", el: ["Ποταμός Ονόν, 1206", "Ο Τεμουτζίν, ορφανός που επέζησε της πείνας και της σκλαβιάς, ενώνει όλες τις φυλές της στέπας και ανακηρύσσεται Τζένγκις Χαν, «παγκόσμιος ηγεμόνας»."], en: ["Onon River, 1206", "Temüjin, an orphan who survived hunger and slavery, unites all the tribes of the steppe and is proclaimed Genghis Khan, 'universal ruler'."] },
        { lat: 39.9, lng: 116.4, k: 3, date: "1215", el: ["Τζονγκντού (Πεκίνο), 1215", "Η πρωτεύουσα των Τζιν πέφτει μετά από πολιορκία. Οι Μογγόλοι μαθαίνουν τις πολιορκητικές μηχανές της Κίνας και θα τις χρησιμοποιήσουν σε όλη την Ασία."], en: ["Zhongdu (Beijing), 1215", "The Jin capital falls after a siege. The Mongols learn China's siege engines and will use them across Asia."] },
        { lat: 39.65, lng: 66.97, k: 3, date: "1220", el: ["Σαμαρκάνδη, 1220", "Ο σάχης του Χωρεσμ σκότωσε Μογγόλους εμπόρους. Η τιμωρία: Μπουχάρα, Σαμαρκάνδη και Ουργκέντς ισοπεδώνονται, εκατομμύρια πεθαίνουν. Η αυτοκρατορία του σάχη εξαφανίζεται σε δύο χρόνια."], en: ["Samarkand, 1220", "The Shah of Khwarezm killed Mongol merchants. The punishment: Bukhara, Samarkand and Urgench are levelled, millions die. The Shah's empire vanishes in two years."] },
        { lat: 47.0, lng: 37.5, k: 3, date: "1223-05", el: ["Ποταμός Κάλκα, 1223", "Οι στρατηγοί Σουμπουτάι και Τζέμπε περνούν τον Καύκασο και συντρίβουν Ρώσους πρίγκιπες και Κουμάνους. Είναι μόνο αναγνώριση· η μεγάλη εισβολή στην Ευρώπη θα έρθει το 1237."], en: ["Kalka River, 1223", "Generals Subutai and Jebe cross the Caucasus and crush Russian princes and Cumans. It is only a reconnaissance; the great invasion of Europe will come in 1237."] },
        { lat: 36.0, lng: 105.0, k: 3, date: "1227-08", el: ["Όρη Λιουπάν, Αύγουστος 1227", "Ο Τζένγκις Χαν πεθαίνει σε εκστρατεία κατά των Σι Σια. Ο τάφος του δεν βρέθηκε ποτέ. Η αυτοκρατορία του απλώνεται από την Κίνα ως την Κασπία."], en: ["Liupan Mountains, August 1227", "Genghis Khan dies on campaign against the Xi Xia. His grave has never been found. His empire stretches from China to the Caspian."] },
        { lat: 47.2, lng: 102.8, k: 3, date: "1235", el: ["Καρακορούμ, 1235", "Ο γιος του Ογκοντέι χτίζει πρωτεύουσα στη στέπα. Ως το 1279 οι απόγονοι του Τζένγκις θα κυβερνούν τη μεγαλύτερη συνεχόμενη αυτοκρατορία της ιστορίας: 24 εκατ. τ.χλμ., από την Κορέα ως την Ουγγαρία."], en: ["Karakorum, 1235", "His son Ögedei builds a capital on the steppe. By 1279 Genghis's descendants rule the largest contiguous empire in history: 24 million km², from Korea to Hungary."] },
      ],
    },
    russia1812: {
      kind: "tour", color: "#9ec5ff",
      stops: [
        { lat: 55.0, lng: 24.0, k: 4, date: "1812-06-24", el: ["Ποταμός Νιέμεν, 24 Ιουνίου 1812", "Η Μεγάλη Στρατιά περνά τα σύνορα: 600.000 άνδρες από 20 έθνη, ο μεγαλύτερος στρατός που είχε δει η Ευρώπη. Ο Ναπολέων περιμένει γρήγορη νίκη."], en: ["Niemen River, 24 June 1812", "The Grande Armée crosses the border: 600,000 men from 20 nations, the largest army Europe had seen. Napoleon expects a quick victory."] },
        { lat: 54.78, lng: 32.05, k: 4, date: "1812-08-17", el: ["Σμολένσκ, 17 Αυγούστου", "Οι Ρώσοι υποχωρούν συνεχώς, καίγοντας χωριά και σιτηρά. Η πόλη καίγεται· ο Ναπολέων τη κερδίζει, αλλά ήδη έχει χάσει 100.000 άνδρες από αρρώστια, πείνα και λιποταξία."], en: ["Smolensk, 17 August", "The Russians keep retreating, burning villages and grain. The city burns; Napoleon takes it, but has already lost 100,000 men to disease, hunger and desertion."] },
        { lat: 55.52, lng: 35.82, k: 4, date: "1812-09-07", el: ["Μποροντινό, 7 Σεπτεμβρίου", "Η αιματηρότερη μάχη των Ναπολεόντειων πολέμων: 70.000 νεκροί και τραυματίες σε μία μέρα. Ο Κουτούζοφ υποχωρεί, αλλά ο ρωσικός στρατός δεν διαλύεται."], en: ["Borodino, 7 September", "The bloodiest battle of the Napoleonic wars: 70,000 dead and wounded in one day. Kutuzov retreats, but the Russian army is not destroyed."] },
        { lat: 55.75, lng: 37.62, k: 4, date: "1812-09-14", el: ["Μόσχα, 14 Σεπτεμβρίου", "Ο Ναπολέων μπαίνει σε μια άδεια πόλη. Την ίδια νύχτα η Μόσχα παραδίδεται στις φλόγες. Ο Τσάρος αρνείται να διαπραγματευτεί. Πέντε εβδομάδες αναμονής μέσα στα αποκαΐδια."], en: ["Moscow, 14 September", "Napoleon enters an empty city. That same night Moscow goes up in flames. The Tsar refuses to negotiate. Five weeks of waiting among the ashes."] },
        { lat: 54.3, lng: 28.5, k: 4, date: "1812-11-26", el: ["Μπερεζινά, 26 Νοεμβρίου", "Η υποχώρηση μέσα στον χειμώνα: -30 °C, Κοζάκοι, πείνα. Στον παγωμένο ποταμό οι σκαπανείς στήνουν γέφυρες μέσα στο νερό. Δεκάδες χιλιάδες μένουν πίσω."], en: ["Berezina, 26 November", "The retreat through winter: -30 °C, Cossacks, starvation. At the frozen river the engineers build bridges standing in the water. Tens of thousands are left behind."] },
        { lat: 55.0, lng: 24.0, k: 4, date: "1812-12-14", el: ["Νιέμεν, 14 Δεκεμβρίου 1812", "Από τους 600.000 επιστρέφουν λιγότεροι από 30.000 ικανοί να πολεμήσουν. Ο Ναπολέων είχε ήδη φύγει με έλκηθρο για το Παρίσι. Σε δύο χρόνια θα έχει χάσει τον θρόνο."], en: ["Niemen, 14 December 1812", "Of 600,000, fewer than 30,000 return fit to fight. Napoleon had already left by sleigh for Paris. Within two years he will lose his throne."] },
      ],
    },
    ww2: {
      kind: "tour", color: "#ff5c5c",
      stops: [
        { lat: 52.23, lng: 21.01, k: 3.5, date: "1939-09-01", el: ["Πολωνία, 1 Σεπτεμβρίου 1939", "Η Γερμανία εισβάλλει με «κεραυνοβόλο πόλεμο»· στις 17 η ΕΣΣΔ από ανατολικά. Βρετανία και Γαλλία κηρύσσουν πόλεμο. Σε 5 εβδομάδες η Πολωνία έχει μοιραστεί."], en: ["Poland, 1 September 1939", "Germany invades with 'blitzkrieg'; on the 17th the USSR from the east. Britain and France declare war. In 5 weeks Poland is divided."] },
        { lat: 48.86, lng: 2.35, k: 3.5, date: "1940-06-14", el: ["Παρίσι, 14 Ιουνίου 1940", "Η Γαλλία πέφτει σε 6 εβδομάδες. Ο Χίτλερ φωτογραφίζεται στον Πύργο του Άιφελ. Η Βρετανία μένει μόνη· τη σώζει η RAF στη Μάχη της Βρετανίας."], en: ["Paris, 14 June 1940", "France falls in 6 weeks. Hitler is photographed at the Eiffel Tower. Britain stands alone; the RAF saves it in the Battle of Britain."] },
        { lat: 21.35, lng: -157.95, k: 3, date: "1941-12-07", el: ["Περλ Χάρμπορ, 7 Δεκεμβρίου 1941", "Η Ιαπωνία βυθίζει τον αμερικανικό στόλο του Ειρηνικού. Οι ΗΠΑ μπαίνουν στον πόλεμο. Έξι μήνες πριν, η Γερμανία είχε εισβάλει στην ΕΣΣΔ. Ο πόλεμος είναι πλέον παγκόσμιος."], en: ["Pearl Harbor, 7 December 1941", "Japan sinks the US Pacific fleet. The United States enters the war. Six months earlier Germany had invaded the USSR. The war is now global."] },
        { lat: 48.7, lng: 44.5, k: 3.5, date: "1943-02-02", el: ["Στάλινγκραντ, 2 Φεβρουαρίου 1943", "Μετά από 5 μήνες μάχης σπίτι-σπίτι, η 6η Στρατιά παραδίδεται. 2 εκατομμύρια νεκροί, τραυματίες και αιχμάλωτοι. Η Γερμανία δεν θα προελάσει ξανά στην Ανατολή."], en: ["Stalingrad, 2 February 1943", "After 5 months of house-to-house fighting, the 6th Army surrenders. 2 million dead, wounded and captured. Germany will never advance in the East again."] },
        { lat: 49.34, lng: -0.85, k: 4, date: "1944-06-06", el: ["Νορμανδία, 6 Ιουνίου 1944", "D-Day: 156.000 Σύμμαχοι αποβιβάζονται σε 5 παραλίες, η μεγαλύτερη αμφίβια επιχείρηση της ιστορίας. Το Παρίσι ελευθερώνεται τον Αύγουστο."], en: ["Normandy, 6 June 1944", "D-Day: 156,000 Allied troops land on 5 beaches, the largest amphibious operation in history. Paris is liberated in August."] },
        { lat: 52.52, lng: 13.4, k: 4, date: "1945-05-08", el: ["Βερολίνο, 8 Μαΐου 1945", "Ο Χίτλερ αυτοκτονεί στις 30 Απριλίου· η κόκκινη σημαία στο Ράιχσταγκ. Η Γερμανία παραδίδεται άνευ όρων. Η Ευρώπη μετρά 40 εκατομμύρια νεκρούς και το Ολοκαύτωμα."], en: ["Berlin, 8 May 1945", "Hitler kills himself on 30 April; the red flag on the Reichstag. Germany surrenders unconditionally. Europe counts 40 million dead and the Holocaust."] },
        { lat: 34.39, lng: 132.46, k: 4, date: "1945-08-06", el: ["Χιροσίμα, 6 Αυγούστου 1945", "Η πρώτη ατομική βόμβα: 80.000 νεκροί σε δευτερόλεπτα. Στις 9 το Ναγκασάκι. Στις 15 Αυγούστου η Ιαπωνία παραδίδεται. Ο πόλεμος τελειώνει με 70–85 εκατ. νεκρούς παγκοσμίως."], en: ["Hiroshima, 6 August 1945", "The first atomic bomb: 80,000 dead in seconds. Nagasaki on the 9th. On 15 August Japan surrenders. The war ends with 70–85 million dead worldwide."] },
      ],
    },
  };
})();
