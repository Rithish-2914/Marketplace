import { supabase } from '../supabase';

export const uploadImageToSupabase = async (file: File, bucket: string, path: string): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${path}/${fileName}`;

    console.log('Uploading to Supabase:', { bucket, filePath, fileName });

    const { error: uploadError, data: uploadData } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message || JSON.stringify(uploadError)}`);
    }

    console.log('Upload successful:', uploadData);

    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    console.log('Public URL:', data.publicUrl);

    return data.publicUrl;
};
