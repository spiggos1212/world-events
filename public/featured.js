// Κορυφαία γεγονότα με πλούσιο περιεχόμενο: βίντεο (Wikimedia Commons), 3D μοντέλα (Sketchfab embed) και μίνι ιστορίες (tours).
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

    // ---------------- ΖΩΓΡΑΦΙΣΜΕΝΕΣ ΣΚΗΝΕΣ ΠΑΝΩ ΣΤΟΝ ΧΑΡΤΗ (scenes.js) ----------------
    giza: {
      kind: "scene", scene: "pyramid",
      caption: { el: "146 μέτρα ύψος και 2,3 εκατ. ογκόλιθοι. Ο άνθρωπος δίπλα της είναι σε πραγματική κλίμακα: μια κουκκίδα.", en: "146 metres tall, 2.3 million blocks. The person beside it is at true scale: a dot." },
    },
    parthenon: {
      kind: "scene", scene: "parthenon",
      caption: { el: "Ικτίνος, Καλλικράτης, Φειδίας, 447–432 π.Χ. Ύψος 13,7 μέτρα· ο άνθρωπος δίπλα σε κλίμακα.", en: "Ictinus, Callicrates, Phidias, 447–432 BC. 13.7 metres tall; the person beside it is to scale." },
    },
    einstein: {
      kind: "scene", scene: "einstein",
      caption: { el: "Το 1905, ένας 26χρονος υπάλληλος γραφείου ευρεσιτεχνιών στη Βέρνη αλλάζει τη φυσική: χρόνος, χώρος, μάζα και ενέργεια δεν θα είναι ποτέ ξανά τα ίδια.", en: "In 1905 a 26-year-old patent clerk in Bern changes physics: time, space, mass and energy will never be the same." },
    },
    titanic: {
      kind: "scene", scene: "titanic",
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
        { lat: 38.19, lng: 15.55, k: 4, date: "1347-10", scene: "plaguedoctor", el: ["Μεσσήνη, Οκτώβριος 1347", "Δώδεκα γενουατικές γαλέρες φτάνουν στη Σικελία με ετοιμοθάνατα πληρώματα. Η πόλη τις διώχνει, αλλά είναι αργά: η πανώλη έχει πατήσει στην Ευρώπη."], en: ["Messina, October 1347", "Twelve Genoese galleys reach Sicily with dying crews. The city expels them, but too late: the plague has landed in Europe."] },
        { lat: 43.3, lng: 5.37, k: 3.5, date: "1348-01", el: ["Μασσαλία, Γένοβα, Βενετία, χειμώνας 1348", "Τα λιμάνια της Μεσογείου πέφτουν το ένα μετά το άλλο. Η Βενετία επινοεί την «καραντίνα»: σαράντα ημέρες απομόνωσης για τα πλοία."], en: ["Marseille, Genoa, Venice, winter 1348", "The Mediterranean ports fall one after another. Venice invents 'quarantine': forty days of isolation for ships."] },
        { lat: 48.86, lng: 2.35, k: 3.5, date: "1348-08", scene: "plaguedoctor", el: ["Παρίσι και Λονδίνο, 1348", "Το καλοκαίρι φτάνει στο Παρίσι, όπου πεθαίνουν 800 την ημέρα, και τον Νοέμβριο στο Λονδίνο. Οι γιατροί συνιστούν αρώματα και αφαιμάξεις· τίποτα δεν βοηθά."], en: ["Paris and London, 1348", "In summer it reaches Paris, where 800 die a day, and in November London. Doctors prescribe perfumes and bloodletting; nothing helps."] },
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
  };
})();
