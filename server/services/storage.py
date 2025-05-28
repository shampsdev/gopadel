import logging
import mimetypes
import os
import uuid
import imghdr
import io
from typing import Optional, Tuple

import boto3
import requests
from botocore.exceptions import ClientError
from config import S3Config, settings
from PIL import Image


class Storage:
    def __init__(self, cfg: Optional[S3Config] = None):
        self.cfg = cfg or settings.S3_CONFIG
        try:
            self.session = boto3.Session(
                aws_access_key_id=self.cfg.access_key_id,
                aws_secret_access_key=self.cfg.secret_key,
                region_name=self.cfg.region,
            )
            self.s3_client = self.session.client(
                "s3", endpoint_url=self.cfg.endpoint_url
            )
            self.root_dir = self.cfg.root_directory.rstrip("/")
        except Exception as e:
            raise RuntimeError(f"Failed to create AWS session: {e}")

    def save_image_by_url(self, image_url: str, key: Optional[str] = None) -> str:
        try:
            resp = requests.get(image_url, timeout=10, stream=True)
            resp.raise_for_status()
            data = resp.content

            content_type = resp.headers.get("Content-Type", "application/octet-stream")
            ext = (
                mimetypes.guess_extension(content_type)
                or os.path.splitext(image_url)[1]
                or ".jpg"
            )

            return self._upload(data, key, content_type, ext)
        except Exception as e:
            raise RuntimeError(f"Failed to process image {image_url}: {e}")

    def save_image_by_bytes(self, image_data: bytes, key: Optional[str] = None) -> str:
        try:
            # Detect content type and extension from image data
            content_type, ext = self._detect_image_type(image_data)

            # Convert to appropriate format if needed
            if ext in [".jpg", ".jpeg", ".png"]:
                # Keep as is - these are supported formats
                processed_data = image_data
            else:
                # Convert to PNG as a fallback
                img = Image.open(io.BytesIO(image_data))
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format="PNG")
                processed_data = img_byte_arr.getvalue()
                content_type = "image/png"
                ext = ".png"

            return self._upload(processed_data, key, content_type, ext)
        except Exception as e:
            # Fallback to jpg if any error occurs
            logging.warning(f"Error processing image format: {e}. Saving as JPG.")
            try:
                img = Image.open(io.BytesIO(image_data))
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format="JPEG")
                processed_data = img_byte_arr.getvalue()
                return self._upload(processed_data, key, "image/jpeg", ".jpg")
            except Exception as e2:
                raise RuntimeError(f"Failed to process image data: {e2}")

    def _detect_image_type(self, image_data: bytes) -> Tuple[str, str]:
        """Detect image type from binary data."""
        # Try using imghdr to detect format
        img_format = imghdr.what(None, h=image_data)

        if img_format:
            if img_format == "jpeg":
                return "image/jpeg", ".jpg"
            elif img_format == "png":
                return "image/png", ".png"
            elif img_format == "gif":
                return "image/gif", ".gif"
            elif img_format == "webp":
                return "image/webp", ".webp"

        # Try with PIL as a fallback
        try:
            img = Image.open(io.BytesIO(image_data))
            fmt = img.format.lower() if img.format else "jpeg"

            if fmt == "jpeg":
                return "image/jpeg", ".jpg"
            elif fmt == "png":
                return "image/png", ".png"
            elif fmt == "gif":
                return "image/gif", ".gif"
            elif fmt == "webp":
                return "image/webp", ".webp"
        except Exception:
            pass

        # Default to JPEG if detection fails
        return "image/jpeg", ".jpg"

    def _upload(
        self,
        data: bytes,
        key: Optional[str],
        content_type: str,
        ext: str,
    ) -> str:
        if not key:
            key = uuid.uuid4().hex
        key = f"{self.root_dir}/{key}{ext}"

        try:
            self.s3_client.put_object(
                Bucket=self.cfg.bucket,
                Key=key,
                Body=data,
                ContentType=content_type,
            )
            url = f"{self.cfg.endpoint_url.rstrip('/')}/{self.cfg.bucket}/{key}"
            logging.info(f"Uploaded image to {url}")
            return url
        except ClientError as e:
            raise RuntimeError(f"Failed to upload to S3: {e}")
