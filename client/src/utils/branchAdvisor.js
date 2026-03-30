const branchDatabase = [
    { branch: "Kardiyoloji", keywords: ["kalp", "göğüs ağrısı", "çarpıntı", "tansiyon", "nefes darlığı"] },
    { branch: "Dermatoloji", keywords: ["kaşıntı", "sivilce", "leke", "akne", "mantar", "saç dökülmesi"] },
    { branch: "Göz Hastalıkları", keywords: ["bulanık", "göz", "görme", "lens", "kızarıklık", "göz ağrısı"] },
    { branch: "Ortopedi", keywords: ["kırık", "çatlak", "alçı", "kemik", "eklem", "diz", "bel ağrısı"] },
    { branch: "Nöroloji", keywords: ["baş ağrısı", "baş dönmesi", "felç", "hafıza", "titreme", "uyuşma"] },
    { branch: "KBB", keywords: ["boğaz", "burun", "geniz", "kulak", "çınlama", "işitme", "sinüzit"] },
    { branch: "Dahiliye", keywords: ["halsizlik", "karın ağrısı", "şeker", "mide", "sindirim", "ateş"] },
    { branch: "Psikiyatri", keywords: ["stres", "kaygı", "depresyon", "uyku", "panik", "mutsuzluk"] }
];

export const getSuggestedBranch = (symptoms) => {
    if (!symptoms) return [];
    const lowerSymptoms = symptoms.toLowerCase();

    const scores = branchDatabase.map(item => {
        let score = 0;
        item.keywords.forEach(keyword => {
            if (lowerSymptoms.includes(keyword)) score++;
        });
        return { branch: item.branch, score };
    });

    const suggestions = scores
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score);

    return suggestions.length > 0 ? suggestions : [{ branch: "Dahiliye (Genel öneri - Belirti eşleşmedi)", score: 0 }];
};
