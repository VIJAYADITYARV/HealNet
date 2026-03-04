export const sanitizeExperience = (exp: any) => {
    const expObj = exp.toObject ? exp.toObject() : exp;

    // Check both per-post visibility and global user privacy setting
    const isAnon = expObj.visibility === 'ANONYMOUS' ||
        expObj.isAnonymous === true ||
        (expObj.userId && expObj.userId.isAnonymous === true);

    if (isAnon) {
        expObj.userId = {
            _id: null,
            name: 'Anonymous Patient',
            username: 'anonymous',
            profilePicture: '',
            isAnonymous: true
        };
        // Ensure per-post flags are synced for frontend
        expObj.isAnonymous = true;
        expObj.visibility = 'ANONYMOUS';
    }

    return expObj;
};

export const sanitizeExperiences = (experiences: any[]) => {
    return experiences.map(sanitizeExperience);
};
